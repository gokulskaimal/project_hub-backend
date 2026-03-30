import { ChatMessage } from "../../../domain/entities/ChatMessage";

export interface ISendMessageUseCase {
  execute(
    senderId: string,
    projectId: string,
    content: string,
    type?: "TEXT" | "FILE" | "IMAGE" | "SYSTEM" | "ACTIVITY",
    fileUrl?: string,
  ): Promise<ChatMessage>;
}
