import { ChatMessage } from "../../../domain/entities/ChatMessage";

export interface IGetProjectMessagesUseCase {
  execute(
    projectId: string,
    limit?: number,
    before?: string,
  ): Promise<{ messages: ChatMessage[]; nextCursor: string | null }>;
}
