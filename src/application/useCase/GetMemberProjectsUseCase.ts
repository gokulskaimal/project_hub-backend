import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IProjectRepo } from "../../infrastructure/interface/repositories/IProjectRepo";
import { IGetMemberProjectsUseCase } from "../interface/useCases/IGetMemberProjectsUseCase";
import { Project } from "../../domain/entities/Project";
import { ILogger } from "../../infrastructure/interface/services/ILogger";

@injectable()
export class GetMemberProjectsUseCase implements IGetMemberProjectsUseCase {
  constructor(
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
  ) {}

  async execute(userId: string): Promise<Project[]> {
    this._logger.info(`Fetching projects for team member: ${userId}`);
    return await this._projectRepo.findByTeamMember(userId);
  }
}
