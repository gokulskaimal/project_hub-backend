import { ChatMessage } from "../../../domain/entities/ChatMessage";

export interface IGetProjectMessagesUseCase {
  execute(projectId: string): Promise<ChatMessage[]>;
}
