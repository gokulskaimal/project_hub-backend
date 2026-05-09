// src/application/events/ChatEvents.ts
import { ChatMessage } from "../../domain/entities/ChatMessage";

export interface MessageSentPayload {
  message: ChatMessage;
}

export interface MessageEditedPayload {
  message: ChatMessage;
}

export interface MessageDeletedPayload {
  messageId: string;
  projectId: string;
}

export const CHAT_EVENTS = {
  MESSAGE_SENT: "chat:message_sent",
  MESSAGE_EDITED: "chat:message_edited",
  MESSAGE_DELETED: "chat:message_deleted",
} as const;
