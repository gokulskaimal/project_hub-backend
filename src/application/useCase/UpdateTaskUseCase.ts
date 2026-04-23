import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ITaskRepo } from "../../application/interface/repositories/ITaskRepo";
import { IUpdateTaskUseCase } from "../interface/useCases/IUpdateTaskUseCase";
import { Task } from "../../domain/entities/Task";
import {
  EntityNotFoundError,
  ValidationError,
  ForbiddenError,
} from "../../domain/errors/CommonErrors";

import { ILogger } from "../../application/interface/services/ILogger";
import { ISecurityService } from "../../application/interface/services/ISecurityService";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { UserRole } from "../../domain/enums/UserRole";

import { ISprintRepo } from "../../application/interface/repositories/ISprintRepo";
import { IProjectRepo } from "../../application/interface/repositories/IProjectRepo";
import { ITaskDomainService } from "../../domain/interface/services/ITaskDomainService";
import { ITimeTrackingService } from "../../domain/interface/services/ITimeTrackingService";
import { IEventDispatcher } from "../../application/interface/services/IEventDispatcher";
import { TASK_EVENTS } from "../events/TaskEvents";

@injectable()
export class UpdateTaskUseCase implements IUpdateTaskUseCase {
  constructor(
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
    @inject(TYPES.ISprintRepo) private _sprintRepo: ISprintRepo,
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.ITaskDomainService)
    private _taskDomainService: ITaskDomainService,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
    @inject(TYPES.ITimeTrackingService)
    private _timeTrackingService: ITimeTrackingService,
    @inject(TYPES.IEventDispatcher) private _eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    id: string,
    data: Partial<Task>,
    updaterId?: string,
  ): Promise<Task> {
    this._logger.info(`Executing UpdateTaskUseCase for task ID: ${id}`);
    const task = await this._taskRepo.findById(id);
    if (!task) throw new EntityNotFoundError("Task Not Found", id);

    // RBAC Check
    if (updaterId && task.orgId) {
      await this._securityService.validateOrgAccess(updaterId, task.orgId);
    }

    // Sprint Immutability Check (Velocity Protection)
    if (task.sprintId) {
      const currentSprint = await this._sprintRepo.findById(task.sprintId);
      if (currentSprint && currentSprint.status === "COMPLETED") {
        const updater = updaterId
          ? await this._userRepo.findById(updaterId)
          : null;
        if (updater?.role !== UserRole.SUPER_ADMIN) {
          throw new ValidationError(
            "Tasks in completed sprints are locked and cannot be modified.",
          );
        }
      }
    }

    // 1. Validation
    if (updaterId) {
      const updater = await this._userRepo.findById(updaterId);
      if (updater) {
        //Strict Role Control
        if (
          updater.role !== UserRole.ORG_MANAGER &&
          updater.role !== UserRole.SUPER_ADMIN
        ) {
          // If NOT a manager
          const allowedFields = [
            "status",
            "timeLogs",
            "totalTimeSpent",
            "completedAt",
            "comments",
            "attachments",
          ];
          const attemptedFields = Object.keys(data).filter(
            (key) => data[key as keyof Partial<Task>] !== undefined,
          );
          const hasUnauthorizedFields = attemptedFields.some(
            (field) => !allowedFields.includes(field),
          );

          if (hasUnauthorizedFields) {
            throw new ForbiddenError(
              "Members can only update task status, comments, and attachments. Core details are reserved for Managers.",
            );
          }
        }

        this._taskDomainService.validateStatusTransition(
          task,
          data.status,
          updater,
        );
      }
    }

    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([key, value]) => {
        if (value === null) {
          return ["epicId", "sprintId", "parentTaskId"].includes(key);
        }
        return value !== undefined;
      }),
    );

    const mergedTask = { ...task, ...filteredData } as Task;

    // Domain Rule: Assignment to Sprint (Must be estimated)
    if (data.sprintId && data.sprintId !== task.sprintId) {
      this._taskDomainService.validateAssignmentToSprint(mergedTask);
    }

    // Domain Rule: Definition of Done (Must have assignee)
    if (data.status === "DONE" && task.status !== "DONE") {
      this._taskDomainService.validateDefinitionOfDone(mergedTask);

      // Professional Workflow: Check for unfinished subtasks
      const children = await this._taskRepo.findByParent(id);
      await this._taskDomainService.validateCompletionGuard(
        mergedTask,
        children,
      );
    }

    if (data.dueDate !== undefined || data.sprintId !== undefined) {
      const effectiveDueDateStr =
        data.dueDate !== undefined ? data.dueDate : task.dueDate;
      const effectiveSprintId =
        data.sprintId !== undefined ? data.sprintId : task.sprintId;

      if (effectiveDueDateStr) {
        const taskDueDate = new Date(effectiveDueDateStr);
        const sprint = effectiveSprintId
          ? await this._sprintRepo.findById(effectiveSprintId)
          : null;
        const project = await this._projectRepo.findById(task.projectId);

        this._taskDomainService.validateDueDate(taskDueDate, sprint, project);
      }
    }

    // Hierarchy Re-validation on Update
    if (
      data.type !== undefined ||
      data.parentTaskId !== undefined ||
      data.sprintId !== undefined
    ) {
      const parentId =
        data.parentTaskId !== undefined ? data.parentTaskId : task.parentTaskId;
      let parentTask = null;
      if (parentId) {
        parentTask = await this._taskRepo.findById(parentId);
      }
      this._taskDomainService.validateHierarchy(mergedTask, parentTask);
    }

    // 2. Sprint Capacity Check
    if (data.sprintId && data.sprintId !== task.sprintId) {
      const sprint = await this._sprintRepo.findById(data.sprintId);
      if (!sprint) throw new ValidationError("Sprint not found");

      if (sprint.status === "COMPLETED") {
        throw new ValidationError(`Cannot assign tasks to a completed sprint.`);
      }

      // Daily limit check
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const dailyCount = await this._taskRepo.countBySprintAssignedAtRange(
        data.sprintId,
        startOfDay,
        endOfDay,
      );
      if (dailyCount >= 20) {
        throw new ValidationError(
          "Daily sprint task limit reached (max 20 tasks per day).",
        );
      }

      // Total sprint capacity check
      const project = await this._projectRepo.findById(sprint.projectId);
      const capacity = this._taskDomainService.calculateSprintCapacity(
        sprint,
        project?.tasksPerWeek,
      );
      const currentCount = await this._taskRepo.countBySprint(data.sprintId);

      if (currentCount >= capacity) {
        throw new ValidationError("Sprint task capacity exceeded.");
      }

      data.sprintAssignedAt = new Date();
    }

    //Time Tracking Logic
    if (data.status && data.status !== task.status && updaterId) {
      this._timeTrackingService.updateTimeLogs(task, data.status, updaterId);
      data.timeLogs = task.timeLogs;
      data.totalTimeSpent = task.totalTimeSpent;
    }

    if (data.status === "DONE" && task.status !== "DONE") {
      data.completedAt = new Date();
    }

    // Perform Update
    const updated = await this._taskRepo.update(id, data);
    if (!updated) throw new EntityNotFoundError("Task Not Found", id);

    // Validate assignee if it's being changed
    if (data.assignedTo && task.orgId) {
      await this._securityService.validateUserBelongsToOrg(
        data.assignedTo,
        task.orgId,
      );
    }

    // 3. Dispatch Domain Event
    this._eventDispatcher.dispatch(TASK_EVENTS.UPDATED, {
      oldTask: task,
      updatedTask: updated,
      updaterId,
      changes: data,
    });

    // Synchronize Denormalized Stats
    if (data.status && data.status !== task.status) {
      const project = await this._projectRepo.findById(task.projectId);
      if (project) {
        let newCompleted = project.completedTasks || 0;
        if (data.status === "DONE") newCompleted++;
        if (task.status === "DONE") newCompleted--;

        const total = project.totalTasks || 0;
        const progress =
          total > 0 ? Math.round((newCompleted / total) * 100) : 0;

        await this._projectRepo.update(project.id, {
          completedTasks: newCompleted,
          progress,
        });
      }
    }

    return updated;
  }
}
