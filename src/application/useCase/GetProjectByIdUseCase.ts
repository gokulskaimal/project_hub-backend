import { injectable, inject } from "inversify";
import { IProjectRepo } from "../../infrastructure/interface/repositories/IProjectRepo";
import { TYPES } from "../../infrastructure/container/types";
import { IGetProjectByIdUseCase } from "../interface/useCases/IGetProjectByIdUseCase";
import { Project } from "../../domain/entities/Project";

@injectable()
export class GetProjectByIdUseCase implements IGetProjectByIdUseCase {
  constructor(@inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo) {}

  async execute(projectId: string): Promise<Project | null> {
    return this._projectRepo.findById(projectId);
  }
}
