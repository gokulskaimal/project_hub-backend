import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IDeleteMessageUseCase } from "../interface/useCases/IDeleteMessageUseCase";
import { IChatRepo } from "../../infrastructure/interface/repositories/IChatRepo";
import { ISocketService } from "../../infrastructure/interface/services/ISocketService";

@injectable()
export class DeleteMessageUseCase implements IDeleteMessageUseCase {
  constructor(
    @inject(TYPES.IChatRepo) private _chatRepo: IChatRepo,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
  ) {}

  async execute(messageId: string, userId: string): Promise<void> {
    const message = await this._chatRepo.findById(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    if (message.senderId !== userId) {
      throw new Error("Unauthorized to delete this message");
    }

    const timeDiff = Date.now() - new Date(message.createdAt).getTime();
    const FIVE_MINUTES = 5 * 60 * 1000;

    if (timeDiff > FIVE_MINUTES) {
      throw new Error("Message cannot be deleted after 5 minutes");
    }

    const projectId = message.projectId;
    await this._chatRepo.deleteMessage(messageId);

    this._socketService.emitToProject(projectId, "chat:deleted", { messageId });
  }
}
