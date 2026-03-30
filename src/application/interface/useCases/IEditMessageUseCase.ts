import { ChatMessage } from "../../../domain/entities/ChatMessage";

export interface IEditMessageUseCase {
  execute(
    messageId: string,
    userId: string,
    newContent: string,
  ): Promise<ChatMessage>;
}
