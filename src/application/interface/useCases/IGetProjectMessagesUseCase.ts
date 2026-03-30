import { ChatMessage } from "../../../domain/entities/ChatMessage";

export interface IGetProjectMessagesUseCase {
  execute(
    projectId: string,
    requesterId: string,
    limit?: number,
    before?: string,
  ): Promise<{ messages: ChatMessage[]; nextCursor: string | null }>;
}
