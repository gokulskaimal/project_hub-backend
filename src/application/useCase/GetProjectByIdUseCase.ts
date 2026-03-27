import { injectable, inject } from "inversify";
import { IProjectRepo } from "../../infrastructure/interface/repositories/IProjectRepo";
import { TYPES } from "../../infrastructure/container/types";
import { IGetProjectByIdUseCase } from "../interface/useCases/IGetProjectByIdUseCase";
import { Project } from "../../domain/entities/Project";
import { ISecurityService } from "../../infrastructure/interface/services/ISecurityService";

@injectable()
export class GetProjectByIdUseCase implements IGetProjectByIdUseCase {
  constructor(
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(
    projectId: string,
    requesterId: string,
  ): Promise<Project | null> {
    if (!projectId || !projectId.match(/^[0-9a-fA-F]{24}$/)) {
      return null;
    }

    const project = await this._projectRepo.findById(projectId);
    if (!project) return null;

    // Validate access
    await this._securityService.validateProjectAccess(requesterId, projectId);

    return project;
  }
}
