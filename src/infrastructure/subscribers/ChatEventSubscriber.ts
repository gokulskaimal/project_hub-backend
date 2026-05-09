import { injectable, inject } from "inversify";
import { TYPES } from "../container/types";
import { IEventDispatcher } from "../../application/interface/services/IEventDispatcher";
import { ISocketService } from "../../application/interface/services/ISocketService";
import { ILogger } from "../../application/interface/services/ILogger";
import { INotificationService } from "../../domain/interface/services/INotificationService";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { IProjectRepo } from "../../application/interface/repositories/IProjectRepo";
import { NotificationType } from "../../domain/enums/NotificationType";
import {
  CHAT_EVENTS,
  MessageSentPayload,
  MessageEditedPayload,
  MessageDeletedPayload,
} from "../../application/events/ChatEvents";
import { IEventSubscriber } from "../../application/interface/services/IEventSubscriber";
import { EventDispatcher } from "../services/EventDispatcher";

@injectable()
export class ChatEventSubscriber implements IEventSubscriber {
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
      this._eventDispatcher.on(CHAT_EVENTS.MESSAGE_SENT, (data) =>
        this.handleMessageSent(data as MessageSentPayload),
      );
      this._eventDispatcher.on(CHAT_EVENTS.MESSAGE_EDITED, (data) =>
        this.handleMessageEdited(data as MessageEditedPayload),
      );
      this._eventDispatcher.on(CHAT_EVENTS.MESSAGE_DELETED, (data) =>
        this.handleMessageDeleted(data as MessageDeletedPayload),
      );
      this._logger.info("ChatEventSubscriber: Listeners initialized.");
    }
  }
  private async handleMessageSent(payload: MessageSentPayload): Promise<void> {
    const { message } = payload;
    // Emit to a specific chat room
    this._socketService.emitToProject(
      message.projectId,
      "chat:message",
      message,
    );

    // PERSISTENT: Mention detection
    const mentions = message.content.match(/@(\w+)/g);
    if (mentions) {
      this._logger.info(`Detected ${mentions.length} mentions in message`);

      const project = await this._projectRepo.findById(message.projectId);
      const orgId = project?.orgId;
      if (!orgId) return;

      for (const mention of mentions) {
        const firstName = mention.substring(1);
        const user = await this._userRepo.findByFirstNameAndOrg?.(
          firstName,
          orgId,
        );

        if (user && user.id !== message.senderId) {
          await this._notificationService.sendSystemNotification(
            user.id,
            "You were mentioned",
            `A user mentioned you in a project chat: "${message.content.substring(0, 50)}..."`,
            NotificationType.INFO,
            orgId,
            `/manager/projects/${message.projectId}/chat`,
          );
        }
      }
    }
  }
  private async handleMessageEdited(
    payload: MessageEditedPayload,
  ): Promise<void> {
    const { message } = payload;
    this._socketService.emitToProject(
      message.projectId,
      "chat:message_edited",
      message,
    );
  }
  private async handleMessageDeleted(
    payload: MessageDeletedPayload,
  ): Promise<void> {
    const { messageId, projectId } = payload;
    this._socketService.emitToProject(projectId, "chat:message_deleted", {
      messageId,
    });
  }
}
