import { ChatMessage } from "../../domain/entities/ChatMessage";

export interface ChatMessageDTO {
  id: string;
  projectId: string;
  senderId: string;
  content: string;
  type: string;
  fileUrl: string | null;
  createdAt: string;
  senderName?: string;
  senderAvatar?: string;
}

export function toChatMessageDTO(message: ChatMessage): ChatMessageDTO {
  return {
    id: message.id,
    projectId: message.projectId,
    senderId: message.senderId,
    content: message.content,
    type: message.type,
    fileUrl: message.fileUrl,
    createdAt: message.createdAt.toISOString(),
    senderName: message.senderName,
    senderAvatar: message.senderAvatar,
  };
}
