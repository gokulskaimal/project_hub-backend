import { injectable, inject } from "inversify";
import { TYPES } from "../container/types";
import { IEventDispatcher } from "../../application/interface/services/IEventDispatcher";
import { ISocketService } from "../../application/interface/services/ISocketService";
import { INotificationService } from "../../domain/interface/services/INotificationService";
import { IProjectRepo } from "../../application/interface/repositories/IProjectRepo";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { ILogger } from "../../application/interface/services/ILogger";
import {
  MEETING_EVENTS,
  MeetingCreatedPayload,
  MeetingUpdatedPayload,
  MeetingDeletedPayload,
} from "../../application/events/MeetingEvents";
import { NotificationType } from "../../domain/enums/NotificationType";
import { IEventSubscriber } from "../../application/interface/services/IEventSubscriber";
import { EventDispatcher } from "../services/EventDispatcher";

@injectable()
export class MeetingEventSubscriber implements IEventSubscriber {
  constructor(
    @inject(TYPES.IEventDispatcher) private _eventDispatcher: IEventDispatcher,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
    @inject(TYPES.INotificationService)
    private _notificationService: INotificationService,
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
  ) {}

  public init(): void {
    if (this._eventDispatcher instanceof EventDispatcher) {
      this._eventDispatcher.on(MEETING_EVENTS.CREATED, (data) =>
        this.handleMeetingCreated(data as MeetingCreatedPayload),
      );
      this._eventDispatcher.on(MEETING_EVENTS.UPDATED, (data) =>
        this.handleMeetingUpdated(data as MeetingUpdatedPayload),
      );
      this._eventDispatcher.on(MEETING_EVENTS.DELETED, (data) =>
        this.handleMeetingDeleted(data as MeetingDeletedPayload),
      );
      this._eventDispatcher.on(MEETING_EVENTS.COMPLETED, (data) =>
        this.handleMeetingCompleted(data as MeetingUpdatedPayload),
      );
      this._logger.info("MeetingEventSubscriber: Listeners initialized.");
    }
  }

  private async handleMeetingCreated(
    payload: MeetingCreatedPayload,
  ): Promise<void> {
    const { meeting, creatorId } = payload;
    const { projectId, title, type } = meeting;

    try {
      const project = await this._projectRepo.findById(projectId);
      if (!project) return;

      const creator = await this._userRepo.findById(creatorId);
      const creatorName = creator
        ? `${creator.firstName} ${creator.lastName || ""}`.trim()
        : "A manager";

      // 1. Real-time Socket Update for the project
      this._socketService.emitToProject(projectId, "meeting:created", meeting);

      // 2. Real-time Socket Update for the whole organization (to refresh global lists)
      this._socketService.emitToOrganization(
        project.orgId,
        "meeting:created",
        meeting,
      );

      // 3. Notifications for all team members
      if (project.teamMemberIds && project.teamMemberIds.length > 0) {
        for (const memberId of project.teamMemberIds) {
          if (memberId === creatorId) continue;

          await this._notificationService.sendSystemNotification(
            memberId,
            "New Sprint Meeting",
            `A new ${type.toLowerCase()} meeting '${title}' has been scheduled by ${creatorName}.`,
            NotificationType.INFO,
            project.orgId,
            `/member/projects/${projectId}`,
          );
        }
      }
    } catch (error) {
      this._logger.error(
        "Error in MeetingEventSubscriber.handleMeetingCreated:",
        error as Error,
      );
    }
  }

  private async handleMeetingUpdated(
    payload: MeetingUpdatedPayload,
  ): Promise<void> {
    const { meeting } = payload;
    try {
      this._socketService.emitToProject(
        meeting.projectId,
        "meeting:updated",
        meeting,
      );

      const project = await this._projectRepo.findById(meeting.projectId);
      if (project) {
        this._socketService.emitToOrganization(
          project.orgId,
          "meeting:updated",
          meeting,
        );
      }
    } catch (error) {
      this._logger.error(
        "Error in MeetingEventSubscriber.handleMeetingUpdated:",
        error as Error,
      );
    }
  }

  private async handleMeetingCompleted(
    payload: MeetingUpdatedPayload,
  ): Promise<void> {
    const { meeting } = payload;
    try {
      this._socketService.emitToProject(
        meeting.projectId,
        "meeting:completed",
        meeting,
      );

      const project = await this._projectRepo.findById(meeting.projectId);
      if (project) {
        this._socketService.emitToOrganization(
          project.orgId,
          "meeting:completed",
          meeting,
        );
      }
    } catch (error) {
      this._logger.error(
        "Error in MeetingEventSubscriber.handleMeetingCompleted:",
        error as Error,
      );
    }
  }

  private async handleMeetingDeleted(
    payload: MeetingDeletedPayload,
  ): Promise<void> {
    const { roomId, projectId } = payload;
    try {
      this._socketService.emitToProject(projectId, "meeting:deleted", {
        roomId,
      });

      const project = await this._projectRepo.findById(projectId);
      if (project) {
        this._socketService.emitToOrganization(
          project.orgId,
          "meeting:deleted",
          { roomId },
        );
      }
    } catch (error) {
      this._logger.error(
        "Error in MeetingEventSubscriber.handleMeetingDeleted:",
        error as Error,
      );
    }
  }
}
