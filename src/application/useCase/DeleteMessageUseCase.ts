import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IDeleteMessageUseCase } from "../interface/useCases/IDeleteMessageUseCase";
import { IChatRepo } from "../../application/interface/repositories/IChatRepo";
import { ISocketService } from "../../application/interface/services/ISocketService";
import { ISecurityService } from "../../application/interface/services/ISecurityService";
import {
  EntityNotFoundError,
  ForbiddenError,
  ValidationError,
} from "../../domain/errors/CommonErrors";

@injectable()
export class DeleteMessageUseCase implements IDeleteMessageUseCase {
  constructor(
    @inject(TYPES.IChatRepo) private _chatRepo: IChatRepo,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(messageId: string, userId: string): Promise<void> {
    const message = await this._chatRepo.findById(messageId);
    if (!message) {
      throw new EntityNotFoundError("Message", messageId);
    }

    // Ensure the user still has access to the project
    await this._securityService.validateProjectAccess(
      userId,
      message.projectId,
    );

    if (message.senderId !== userId) {
      throw new ForbiddenError("Unauthorized to delete this message");
    }

    const timeDiff = Date.now() - new Date(message.createdAt).getTime();
    const FIVE_MINUTES = 5 * 60 * 1000;

    if (timeDiff > FIVE_MINUTES) {
      throw new ValidationError("Message cannot be deleted after 5 minutes");
    }

    const projectId = message.projectId;
    await this._chatRepo.deleteMessage(messageId);

    this._socketService.emitToProject(projectId, "chat:deleted", { messageId });
  }
}
