import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ITaskRepo } from "../../infrastructure/interface/repositories/ITaskRepo";
import { IProjectRepo } from "../../infrastructure/interface/repositories/IProjectRepo";
import { ISprintRepo } from "../../infrastructure/interface/repositories/ISprintRepo";
import { ICreateTaskUseCase } from "../interface/useCases/ICreateTaskUseCase";
import { ICreateNotificationUseCase } from "../interface/useCases/ICreateNotificationUseCase";
import { Task } from "../../domain/entities/Task";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import {
  EntityNotFoundError,
  ValidationError,
} from "../../domain/errors/CommonErrors";
import { NotificationType } from "../../domain/enums/NotificationType";
import { User } from "../../domain/entities/User";

import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { ISocketService } from "../../infrastructure/interface/services/ISocketService";

@injectable()
export class CreateTaskUseCase implements ICreateTaskUseCase {
  constructor(
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.ISprintRepo) private _sprintRepo: ISprintRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
    @inject(TYPES.ICreateNotificationUseCase)
    private _createNotificationUC: ICreateNotificationUseCase,
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
  ) {}

  async execute(data: Partial<Task>, creatorId: string): Promise<Task> {
    if (!data.projectId) throw new ValidationError("Project Id is required");
    const project = await this._projectRepo.findById(data.projectId);
    if (!project)
      throw new EntityNotFoundError("Project Not Found", data.projectId);
    if (project.orgId !== data.orgId)
      throw new ValidationError("Project does not belong to this organization");

    if (data.dueDate) {
      const taskDueDate = new Date(data.dueDate);

      if (data.sprintId) {
        const sprint = await this._sprintRepo.findById(data.sprintId);
        if (sprint && sprint.startDate && sprint.endDate) {
          const sprintStart = new Date(sprint.startDate);
          const sprintEnd = new Date(sprint.endDate);
          if (taskDueDate < sprintStart || taskDueDate > sprintEnd) {
            throw new ValidationError(
              "Task due date must be within the assigned Sprint's start and end dates.",
            );
          }
        }
      } else {
        const projectEnd = new Date(project.endDate);
        const projectStart = project.startDate
          ? new Date(project.startDate)
          : null;

        if (projectStart && taskDueDate < projectStart) {
          throw new ValidationError(
            "Task due date cannot be before Project start date.",
          );
        }
        if (taskDueDate > projectEnd) {
          throw new ValidationError(
            "Task due date cannot be after Project end date.",
          );
        }
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

    this._socketService.emitToOrganization(
      data.orgId!,
      "task:created",
      newTask,
    );

    if (newTask.assignedTo) {
      this._socketService.emitToUser(
        newTask.assignedTo,
        "task:assigned",
        newTask,
      );

      let message = `You have been assigned to task: ${newTask.title}`;
      const creator = await this._userRepo.findById(creatorId);
      if (creator) {
        message = `Task assigned to you by ${this.formatUserName(creator)}`;
      }

      await this._createNotificationUC.execute(
        newTask.assignedTo,
        "New Task Assigned",
        message,
        NotificationType.INFO,
        `/manager/projects/${newTask.projectId}`,
      );
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
