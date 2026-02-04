import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IEditMessageUseCase } from "../interface/useCases/IEditMessageUseCase";
import { IChatRepo } from "../../infrastructure/interface/repositories/IChatRepo";
import { ISocketService } from "../../infrastructure/interface/services/ISocketService";
import { ChatMessage } from "../../domain/entities/ChatMessage";

@injectable()
export class EditMessageUseCase implements IEditMessageUseCase {
  constructor(
    @inject(TYPES.IChatRepo) private _chatRepo: IChatRepo,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
  ) {}

  async execute(
    messageId: string,
    userId: string,
    newContent: string,
  ): Promise<ChatMessage> {
    const message = await this._chatRepo.findById(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    if (message.senderId !== userId) {
      throw new Error("Unauthorized to edit this message");
    }

    const timeDiff = Date.now() - new Date(message.createdAt).getTime();
    const FIVE_MINUTES = 5 * 60 * 1000;

    if (timeDiff > FIVE_MINUTES) {
      throw new Error("Message cannot be edited after 5 minutes");
    }

    const updatedMessage = await this._chatRepo.updateMessage(
      messageId,
      newContent,
    );

    if (updatedMessage) {
      this._socketService.emitToProject(
        updatedMessage.projectId,
        "chat:updated",
        updatedMessage,
      );
    }

    return updatedMessage!;
  }
}
