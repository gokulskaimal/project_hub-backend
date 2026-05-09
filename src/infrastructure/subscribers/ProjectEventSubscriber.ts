import { inject, injectable } from "inversify";
import { TYPES } from "../container/types";
import { IEventDispatcher } from "../../application/interface/services/IEventDispatcher";
import { ISocketService } from "../../application/interface/services/ISocketService";
import { INotificationService } from "../../domain/interface/services/INotificationService";
import { ILogger } from "../../application/interface/services/ILogger";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { NotificationType } from "../../domain/enums/NotificationType";
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
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
  ) {}

  public init(): void {
    if (this._eventDispatcher instanceof EventDispatcher) {
      this._eventDispatcher.on(PROJECT_EVENTS.CREATED, (data) =>
        this.handleProjectCreated(data as ProjectCreatedPayload),
      );
      this._eventDispatcher.on(PROJECT_EVENTS.UPDATED, (data) =>
        this.handleProjectUpdated(data as ProjectUpdatedPayload),
      );
      this._eventDispatcher.on(PROJECT_EVENTS.DELETED, (data) =>
        this.handleProjectDeleted(data as ProjectDeletedPayload),
      );
      this._logger.info("ProjectEventSubscriber: Listeners initialized.");
    }
  }

  private async handleProjectCreated(
    payload: ProjectCreatedPayload,
  ): Promise<void> {
    const { project, creatorId } = payload;
    this._socketService.emitToOrganization(
      project.orgId,
      "project:created",
      project,
    );

    // PERSISTENT: Notify the creator/manager
    if (creatorId) {
      await this._notificationService.sendSystemNotification(
        creatorId,
        "Project Created",
        `New project '${project.name}' has been successfully initialized.`,
        NotificationType.SUCCESS,
        project.orgId,
        `/manager/projects/${project.id}`,
      );
    }
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

    // Auditor: Notifications for Managers about the deletion
    const managers = await this._userRepo.findByOrgAndRole(
      orgId,
      UserRole.ORG_MANAGER,
    );
    for (const manager of managers) {
      await this._notificationService.sendSystemNotification(
        manager.id,
        "Project Terminated",
        `Project ID: ${projectId} has been removed from the platform.`,
        NotificationType.WARNING,
        orgId,
        "/manager/projects",
      );
    }
  }
}
