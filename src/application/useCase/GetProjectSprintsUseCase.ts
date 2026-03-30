import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ISprintRepo } from "../../application/interface/repositories/ISprintRepo";
import { Sprint } from "../../domain/entities/Sprint";
import { ILogger } from "../../application/interface/services/ILogger";
import { IGetProjectSprintsUseCase } from "../interface/useCases/IGetProjectSprintsUseCase";
import { ISecurityService } from "../../application/interface/services/ISecurityService";

@injectable()
export class GetProjectSprintsUseCase implements IGetProjectSprintsUseCase {
  constructor(
    @inject(TYPES.ISprintRepo) private _sprintRepo: ISprintRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(projectId: string, requesterId: string): Promise<Sprint[]> {
    this._logger.info(
      `Fetching sprints for project ${projectId} (Requested by: ${requesterId})`,
    );

    // Validate project access
    await this._securityService.validateProjectAccess(requesterId, projectId);

    return await this._sprintRepo.findByProject(projectId);
  }
}
