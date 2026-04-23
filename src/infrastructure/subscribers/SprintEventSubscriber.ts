import { inject, injectable } from "inversify";
import { TYPES } from "../container/types";
import { IEventDispatcher } from "../../application/interface/services/IEventDispatcher";
import { ISocketService } from "../../application/interface/services/ISocketService";
import { ILogger } from "../../application/interface/services/ILogger";
import { INotificationService } from "../../domain/interface/services/INotificationService";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { IProjectRepo } from "../../application/interface/repositories/IProjectRepo";
import { NotificationType } from "../../domain/enums/NotificationType";
import {
  SPRINT_EVENTS,
  SprintCreatedPayload,
  SprintUpdatedPayload,
  SprintDeletedPayload,
} from "../../application/events/SprintEvents";
import { IEventSubscriber } from "../../application/interface/services/IEventSubscriber";
import { EventDispatcher } from "../services/EventDispatcher";

@injectable()
export class SprintEventSubscriber implements IEventSubscriber {
  constructor(
    @inject(TYPES.IEventDispatcher) private _eventDispatcher: IEventDispatcher,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
    @inject(TYPES.INotificationService)
    private _notificationService: INotificationService,
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
  ) {}

  public init(): void {
    if (this._eventDispatcher instanceof EventDispatcher) {
      this._eventDispatcher.on(SPRINT_EVENTS.CREATED, (data) =>
        this.handleSprintCreated(data as SprintCreatedPayload),
      );
      this._eventDispatcher.on(SPRINT_EVENTS.UPDATED, (data) =>
        this.handleSprintUpdated(data as SprintUpdatedPayload),
      );
      this._eventDispatcher.on(SPRINT_EVENTS.DELETED, (data) =>
        this.handleSprintDeleted(data as SprintDeletedPayload),
      );
      this._logger.info("SprintEventSubscriber: Listeners initialized.");
    }
  }

  private async handleSprintCreated(
    payload: SprintCreatedPayload,
  ): Promise<void> {
    const { sprint } = payload;
    this._socketService.emitToProject(
      sprint.projectId,
      "sprint:created",
      sprint,
    );

    // PERSISTENT: Notify project participants
    try {
      const project = await this._projectRepo.findById(sprint.projectId);
      if (project) {
        const orgId = project.orgId;
        // Optionally notify project members or just an audit log for managers
        const managers = await this._userRepo.findByOrgAndRole(
          orgId,
          "ORG_MANAGER",
        );
        for (const manager of managers) {
          await this._notificationService.sendSystemNotification(
            manager.id,
            "Sprint Scheduled",
            `A new sprint '${sprint.name}' has been added to project '${project.name}'.`,
            NotificationType.INFO,
            orgId,
            `/manager/projects/${sprint.projectId}/sprints`,
          );
        }
      }
    } catch (err) {
      this._logger.error(
        "Failed to send sprint creation notification",
        err as Error,
      );
    }
  }

  private async handleSprintUpdated(
    payload: SprintUpdatedPayload,
  ): Promise<void> {
    const { updatedSprint } = payload;
    this._socketService.emitToProject(
      updatedSprint.projectId,
      "sprint:updated",
      updatedSprint,
    );
  }

  private async handleSprintDeleted(
    payload: SprintDeletedPayload,
  ): Promise<void> {
    const { sprintId, projectId } = payload;
    this._socketService.emitToProject(projectId, "sprint:deleted", sprintId);
  }
}
