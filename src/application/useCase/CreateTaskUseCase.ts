import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ITaskRepo } from "../../infrastructure/interface/repositories/ITaskRepo";
import { IProjectRepo } from "../../infrastructure/interface/repositories/IProjectRepo";
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
    this._logger.info(
      `Creating task '${data.title}' in project ${data.projectId}`,
    );

    // [MODIFIED] Generate readable Task ID based on Project Name
    const prefix =
      project.key ||
      project.name
        .substring(0, 3)
        .toUpperCase()
        .replace(/[^A-Z]/g, "PRJ");
    const sequence = (project.taskSequence || 0) + 1;
    const taskKey = `${prefix}-${sequence}`;

    // Update project with new sequence
    await this._projectRepo.update(project.id, { taskSequence: sequence });

    const taskData = { ...data, createdBy: creatorId, taskKey };

    const newTask = await this._taskRepo.create(taskData);

    // Notify organization about the new task
    this._socketService.emitToOrganization(
      data.orgId!,
      "task:created",
      newTask,
    );

    // Notify assignee if specific user is assigned
    if (newTask.assignedTo) {
      // 1. Emit real-time event for UI updates (Kanban board)
      this._socketService.emitToUser(
        newTask.assignedTo,
        "task:assigned",
        newTask,
      );

      // 2. Create persistent notification (Bell & Toast)
      let message = `You have been assigned to task: ${newTask.title}`;

      // Attempt to fetch creator name
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
