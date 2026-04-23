import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ITaskRepo } from "../../application/interface/repositories/ITaskRepo";
import { IProjectRepo } from "../../application/interface/repositories/IProjectRepo";
import { ISprintRepo } from "../../application/interface/repositories/ISprintRepo";
import { ICreateTaskUseCase } from "../interface/useCases/ICreateTaskUseCase";
import { ITaskDomainService } from "../../domain/interface/services/ITaskDomainService";
import { Task } from "../../domain/entities/Task";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import {
  EntityNotFoundError,
  ValidationError,
  ForbiddenError,
} from "../../domain/errors/CommonErrors";
import { UserRole } from "../../domain/enums/UserRole";

import { ISecurityService } from "../../application/interface/services/ISecurityService";

import { ILogger } from "../../application/interface/services/ILogger";
import { IEventDispatcher } from "../interface/services/IEventDispatcher";
import { TASK_EVENTS } from "../events/TaskEvents";

@injectable()
export class CreateTaskUseCase implements ICreateTaskUseCase {
  constructor(
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.ISprintRepo) private _sprintRepo: ISprintRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.IEventDispatcher) private _eventDispatcher: IEventDispatcher,
    @inject(TYPES.ITaskDomainService)
    private _taskDomainService: ITaskDomainService,
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(data: Partial<Task>, creatorId: string): Promise<Task> {
    if (data.orgId) {
      await this._securityService.validateOrgAccess(creatorId, data.orgId);
    }

    const creator = await this._userRepo.findById(creatorId);
    if (!creator) throw new EntityNotFoundError("User", creatorId);
    if (creator.role === UserRole.TEAM_MEMBER) {
      if (data.type == "EPIC") {
        throw new ForbiddenError("Team member cannot create epic");
      }
      if (data.storyPoints !== undefined) {
        throw new ForbiddenError("Only managers can estimate story points");
      }
      if (data.assignedTo && data.assignedTo !== creatorId) {
        throw new ForbiddenError(
          "Team member cannot assign tasks to other users",
        );
      }
    }

    if (!data.projectId) throw new ValidationError("Project Id is required");
    const project = await this._projectRepo.findById(data.projectId);
    if (!project)
      throw new EntityNotFoundError("Project Not Found", data.projectId);
    if (project.orgId !== data.orgId)
      throw new ValidationError("Project does not belong to this organization");

    let parentTask = null;
    if (data.parentTaskId) {
      parentTask = await this._taskRepo.findById(data.parentTaskId);
      if (!parentTask)
        throw new EntityNotFoundError("Parent Task", data.parentTaskId);
    }

    this._taskDomainService.validateHierarchy(data as Task, parentTask);

    if (data.dueDate) {
      const sprint = data.sprintId
        ? await this._sprintRepo.findById(data.sprintId)
        : null;
      this._taskDomainService.validateDueDate(
        new Date(data.dueDate),
        sprint,
        project,
      );
    }

    if (data.sprintId) {
      const sprint = await this._sprintRepo.findById(data.sprintId);
      if (!sprint) throw new ValidationError("Sprint not found");

      // [SCURM] Domain Rule: Assignment to Sprint (Must be estimated)
      this._taskDomainService.validateAssignmentToSprint(data as Task);

      const capacity = this._taskDomainService.calculateSprintCapacity(
        sprint,
        project.tasksPerWeek,
      );
      const currentCount = await this._taskRepo.countBySprint(data.sprintId);
      if (currentCount >= capacity) {
        throw new ValidationError("Sprint task capacity exceeded.");
      }
    }

    const getDayRangeLocal = (): { start: Date; end: Date } => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      return { start, end };
    };

    const getSprintWeeks = (start: Date, end: Date): number => {
      const ms = end.getTime() - start.getTime();
      return Math.max(1, Math.ceil(ms / (7 * 24 * 60 * 60 * 1000)));
    };

    if (data.sprintId) {
      const { start, end } = getDayRangeLocal();
      const dailyCount = await this._taskRepo.countBySprintAssignedAtRange(
        data.sprintId,
        start,
        end,
      );
      if (dailyCount >= 20) {
        throw new ValidationError(
          "Daily sprint task limit reached (max 20 tasks per day).",
        );
      }

      const sprint = await this._sprintRepo.findById(data.sprintId);
      if (!sprint) {
        throw new ValidationError("Sprint not found");
      }

      const tasksPerWeek = project.tasksPerWeek ?? 25;
      const weeks = getSprintWeeks(
        new Date(sprint.startDate),
        new Date(sprint.endDate),
      );
      const sprintCapacity = tasksPerWeek * weeks;

      const currentCount = await this._taskRepo.countBySprint(data.sprintId);
      if (currentCount >= sprintCapacity) {
        throw new ValidationError("Sprint task capacity exceeded.");
      }
    }

    this._logger.info(
      `Creating task '${data.title}' in project ${data.projectId}`,
    );

    const prefix =
      project.key ||
      project.name
        .substring(0, 3)
        .toUpperCase()
        .replace(/[^A-Z]/g, "PRJ");
    const sequence = (project.taskSequence || 0) + 1;
    const taskKey = `${prefix}-${sequence}`;

    await this._projectRepo.update(project.id, { taskSequence: sequence });

    const taskData = {
      ...data,
      createdBy: creatorId,
      taskKey,
      sprintAssignedAt: data.sprintId ? new Date() : undefined,
    };

    const newTask = await this._taskRepo.create(taskData);

    // Dispatch Domain Event for side effects (Sockets, Notifications, History)
    await this._eventDispatcher.dispatch(TASK_EVENTS.CREATED, {
      task: newTask,
      creatorId,
    });

    // Synchronize Denormalized Stats
    const totalTasks = (project.totalTasks || 0) + 1;
    const completedTasks = project.completedTasks || 0;
    const progress =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    await this._projectRepo.update(project.id, {
      totalTasks,
      completedTasks,
      progress,
    });

    return newTask;
  }
}
