import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ITaskRepo } from "../../application/interface/repositories/ITaskRepo";
import { IProjectRepo } from "../../application/interface/repositories/IProjectRepo";
import { ISprintRepo } from "../../application/interface/repositories/ISprintRepo";
import { ICreateTaskUseCase } from "../interface/useCases/ICreateTaskUseCase";
import { INotificationService } from "../../domain/interface/services/INotificationService";
import { ITaskDomainService } from "../../domain/interface/services/ITaskDomainService";
import { Task } from "../../domain/entities/Task";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { UserRole } from "../../domain/enums/UserRole";
import {
  EntityNotFoundError,
  ValidationError,
} from "../../domain/errors/CommonErrors";
import { User } from "../../domain/entities/User";
import { ISecurityService } from "../../application/interface/services/ISecurityService";

import { ILogger } from "../../application/interface/services/ILogger";
import { ISocketService } from "../../application/interface/services/ISocketService";

@injectable()
export class CreateTaskUseCase implements ICreateTaskUseCase {
  constructor(
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.ISprintRepo) private _sprintRepo: ISprintRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
    @inject(TYPES.INotificationService)
    private _notificationService: INotificationService,
    @inject(TYPES.ITaskDomainService)
    private _taskDomainService: ITaskDomainService,
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(data: Partial<Task>, creatorId: string): Promise<Task> {
    if (data.orgId) {
      await this._securityService.validateOrgAccess(creatorId, data.orgId);
    }
    if (!data.projectId) throw new ValidationError("Project Id is required");
    const project = await this._projectRepo.findById(data.projectId);
    if (!project)
      throw new EntityNotFoundError("Project Not Found", data.projectId);
    if (project.orgId !== data.orgId)
      throw new ValidationError("Project does not belong to this organization");

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

    // [NEW] Targeted Real-time Alerts
    // 1. Project Room (Project Details Live Update)
    this._socketService.emitToProject(
      newTask.projectId,
      "task:created",
      newTask,
    );

    // 2. Org Managers (Manager Dashboard Live Update)
    this._socketService.emitToRoleInOrg(
      data.orgId!,
      UserRole.ORG_MANAGER,
      "task:created",
      newTask,
    );

    if (newTask.assignedTo) {
      // Validate that the assignee belongs to this organization
      await this._securityService.validateUserBelongsToOrg(
        newTask.assignedTo,
        data.orgId!,
      );

      this._socketService.emitToUser(
        newTask.assignedTo,
        "task:assigned",
        newTask,
      );

      const creator = await this._userRepo.findById(creatorId);
      if (creator) {
        await this._notificationService.notifyTaskAssignment(newTask, creator);
      }
    }

    return newTask;
  }

  private formatUserName(user: User): string {
    if (user.firstName) {
      return `${user.firstName} ${user.lastName || ""}`.trim();
    }
    return user.name || "User";
  }
}
