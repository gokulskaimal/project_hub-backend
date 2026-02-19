import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IChatRepo } from "../../infrastructure/interface/repositories/IChatRepo";
import { ChatMessage } from "../../domain/entities/ChatMessage";
import { IGetProjectMessagesUseCase } from "../interface/useCases/IGetProjectMessagesUseCase";

@injectable()
export class GetProjectMessagesUseCase implements IGetProjectMessagesUseCase {
  constructor(@inject(TYPES.IChatRepo) private _chatRepo: IChatRepo) {}

  async execute(
    projectId: string,
    limit?: number,
    before?: string,
  ): Promise<{ messages: ChatMessage[]; nextCursor: string | null }> {
    return this._chatRepo.findByProjectId(projectId, limit, before);
  }
}
