import { injectable, inject } from "inversify";
import { TYPES } from "../container/types";
import { IEventDispatcher } from "../../application/interface/services/IEventDispatcher";
import { ISocketService } from "../../application/interface/services/ISocketService";
import { ILogger } from "../../application/interface/services/ILogger";
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
    @inject(TYPES.ILogger) private _logger: ILogger,
  ) {}
  public init(): void {
    if (this._eventDispatcher instanceof EventDispatcher) {
      this._eventDispatcher.on(
        CHAT_EVENTS.MESSAGE_SENT,
        this.handleMessageSent.bind(this),
      );
      this._eventDispatcher.on(
        CHAT_EVENTS.MESSAGE_EDITED,
        this.handleMessageEdited.bind(this),
      );
      this._eventDispatcher.on(
        CHAT_EVENTS.MESSAGE_DELETED,
        this.handleMessageDeleted.bind(this),
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
