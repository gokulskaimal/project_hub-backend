import { ChatMessage } from "../../../domain/entities/ChatMessage";

export interface IChatRepo {
  create(data: Partial<ChatMessage>): Promise<ChatMessage>;
  findByProjectId(
    projectId: string,
    limit?: number,
    before?: string,
  ): Promise<{ messages: ChatMessage[]; nextCursor: string | null }>;
  findById(id: string): Promise<ChatMessage | null>;
  updateMessage(id: string, content: string): Promise<ChatMessage | null>;
  deleteMessage(id: string): Promise<boolean>;
  deleteByProject(projectId: string): Promise<boolean>;
}
