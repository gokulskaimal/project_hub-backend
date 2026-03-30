import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IChatRepo } from "../../application/interface/repositories/IChatRepo";
import { ChatMessage } from "../../domain/entities/ChatMessage";
import { IGetProjectMessagesUseCase } from "../interface/useCases/IGetProjectMessagesUseCase";
import { ISecurityService } from "../../application/interface/services/ISecurityService";

@injectable()
export class GetProjectMessagesUseCase implements IGetProjectMessagesUseCase {
  constructor(
    @inject(TYPES.IChatRepo) private _chatRepo: IChatRepo,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(
    projectId: string,
    requesterId: string,
    limit?: number,
    before?: string,
  ): Promise<{ messages: ChatMessage[]; nextCursor: string | null }> {
    await this._securityService.validateProjectAccess(requesterId, projectId);
    return this._chatRepo.findByProjectId(projectId, limit, before);
  }
}
