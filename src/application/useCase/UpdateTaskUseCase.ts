import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ITaskRepo } from "../../infrastructure/interface/repositories/ITaskRepo";
import { IUpdateTaskUseCase } from "../interface/useCases/IUpdateTaskUseCase";
import { Task } from "../../domain/entities/Task";
import {
  EntityNotFoundError,
  ValidationError,
} from "../../domain/errors/CommonErrors";

import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { ISocketService } from "../../infrastructure/interface/services/ISocketService";
import { ICreateNotificationUseCase } from "../interface/useCases/ICreateNotificationUseCase";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { UserRole } from "../../domain/enums/UserRole";
import { NotificationType } from "../../domain/enums/NotificationType";
import { User } from "../../domain/entities/User";

@injectable()
export class UpdateTaskUseCase implements IUpdateTaskUseCase {
  constructor(
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
    @inject(TYPES.ICreateNotificationUseCase)
    private _createNotificationUC: ICreateNotificationUseCase,
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
  ) {}

  async execute(
    id: string,
    data: Partial<Task>,
    updaterId?: string,
  ): Promise<Task> {
    this._logger.info(`Executing UpdateTaskUseCase for task ID: ${id}`);
    const task = await this._taskRepo.findById(id);
    if (!task) throw new EntityNotFoundError("Task Not Found", id);

    // [START] Validation Logic
    if (updaterId) {
      const updater = await this._userRepo.findById(updaterId);
      if (updater) {
        // Rule 1: Once DONE, the task is locked permanently.
        if (task.status === "DONE") {
          throw new ValidationError(
            "Task is Completed and cannot be modified.",
          );
        }

        const isManager = updater.role === UserRole.ORG_MANAGER;

        if (!isManager) {
          // Rule 2: Team Members cannot set status to DONE.
          if (data.status === "DONE") {
            throw new ValidationError("Only Managers can mark a task as Done.");
          }

          // Rule 3: Functionality Lock - Once in REVIEW, Member cannot edit or revert.
          if (task.status === "REVIEW") {
            throw new ValidationError(
              "Task is under Review. Only Manager can update status.",
            );
          }

          // Rule 4: No Revert - Member cannot move from IN_PROGRESS back to TODO
          if (task.status === "IN_PROGRESS" && data.status === "TODO") {
            throw new ValidationError(
              "Tasks currently In Progress cannot be moved back to Todo.",
            );
          }
        }
      }
    }
    // [END] Validation Logic

    const updated = await this._taskRepo.update(id, data);
    if (!updated) throw new EntityNotFoundError("Task Not Found", id);

    // Notify organization about the update (for Kanban refresh)
    if (task.orgId) {
      this._socketService.emitToOrganization(
        task.orgId,
        "task:updated",
        updated,
      );
    }

    // Bidirectional Notifications
    // Bidirectional Notifications
    if (task.orgId && updaterId) {
      const managers = await this._userRepo.findByOrgAndRole(
        task.orgId,
        UserRole.ORG_MANAGER,
      );
      const updater = await this._userRepo.findById(updaterId);
      const updaterName = updater ? this.formatUserName(updater) : "User";

      // Case A: Updater is the Assignee -> Notify Managers
      if (updaterId === task.assignedTo) {
        // Notify Managers
        for (const manager of managers) {
          if (manager.id === updaterId) continue; // Don't notify self

          await this._createNotificationUC.execute(
            manager.id,
            "Task Update from Member",
            `Task '${updated.title}' updated by ${updaterName} (Status: ${data.status || updated.status})`,
            NotificationType.INFO,
            `/manager/projects/${updated.projectId}`,
          );
        }
      }

      // Case B: Updater is a Manager (or anyone else) -> Notify Assignee
      // Note: If Manager updates, Assignee should know.
      // If Assignee updates, Manager should know (covered above).
      if (updated.assignedTo && updaterId !== updated.assignedTo) {
        await this._createNotificationUC.execute(
          updated.assignedTo,
          "Task Updated by Manager",
          `Task '${updated.title}' updated by ${updaterName} (Status: ${data.status || updated.status})`,
          NotificationType.INFO,
          `/manager/projects/${updated.projectId}`, // Or member link
        );

        // Also emit socket for real-time update
        this._socketService.emitToUser(
          updated.assignedTo,
          "task:assigned", // Or task:updated, but task:assigned triggers refresh
          updated,
        );
      }
    }

    return updated;
  }

  private formatUserName(user: User): string {
    if (user.firstName) {
      return `${user.firstName} ${user.lastName || ""}`.trim();
    }
    return user.name || "User";
  }
}
