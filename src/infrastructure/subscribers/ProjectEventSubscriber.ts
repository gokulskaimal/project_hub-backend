import { inject, injectable } from "inversify";
import { TYPES } from "../container/types";
import { IEventDispatcher } from "../../application/interface/services/IEventDispatcher";
import { ISocketService } from "../../application/interface/services/ISocketService";
import { INotificationService } from "../../domain/interface/services/INotificationService";
import { ILogger } from "../../application/interface/services/ILogger";
import {
  PROJECT_EVENTS,
  ProjectCreatedPayload,
  ProjectUpdatedPayload,
  ProjectDeletedPayload,
} from "../../application/events/ProjectEvents";
import { UserRole } from "../../domain/enums/UserRole";
import { IEventSubscriber } from "../../application/interface/services/IEventSubscriber";
import { EventDispatcher } from "../services/EventDispatcher";

@injectable()
export class ProjectEventSubscriber implements IEventSubscriber {
  constructor(
    @inject(TYPES.IEventDispatcher) private _eventDispatcher: IEventDispatcher,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
    @inject(TYPES.INotificationService)
    private _notificationService: INotificationService,
    @inject(TYPES.ILogger) private _logger: ILogger,
  ) {}

  public init(): void {
    if (this._eventDispatcher instanceof EventDispatcher) {
      this._eventDispatcher.on(
        PROJECT_EVENTS.CREATED,
        this.handleProjectCreated.bind(this),
      );
      this._eventDispatcher.on(
        PROJECT_EVENTS.UPDATED,
        this.handleProjectUpdated.bind(this),
      );
      this._eventDispatcher.on(
        PROJECT_EVENTS.DELETED,
        this.handleProjectDeleted.bind(this),
      );
      this._logger.info("ProjectEventSubscriber: Listeners initialized.");
    }
  }

  private async handleProjectCreated(
    payload: ProjectCreatedPayload,
  ): Promise<void> {
    const { project } = payload;
    this._socketService.emitToOrganization(
      project.orgId,
      "project:created",
      project,
    );
  }

  private async handleProjectUpdated(
    payload: ProjectUpdatedPayload,
  ): Promise<void> {
    const { updatedProject } = payload;
    this._socketService.emitToProject(
      updatedProject.id,
      "project:updated",
      updatedProject,
    );
    this._socketService.emitToRoleInOrg(
      updatedProject.orgId,
      UserRole.ORG_MANAGER,
      "project:updated",
      updatedProject,
    );
  }

  private async handleProjectDeleted(
    payload: ProjectDeletedPayload,
  ): Promise<void> {
    const { projectId, orgId } = payload;
    this._socketService.emitToOrganization(orgId, "project:deleted", {
      projectId,
    });
  }
}
