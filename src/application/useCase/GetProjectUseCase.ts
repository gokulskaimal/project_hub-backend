import { injectable , inject } from "inversify";
import { IProjectRepo } from "../../infrastructure/interface/repositories/IProjectRepo";
import { TYPES } from "../../infrastructure/container/types";
import { IGetProjectUseCase } from "../interface/useCases/IGetProjectUseCase";
import { Project } from "../../domain/entities/Project";

@injectable()

export class GetProjectUseCase implements IGetProjectUseCase{
    constructor(
        @inject(TYPES.IProjectRepo) private _projectRepo : IProjectRepo
    ){}

    async execute(orgId: string): Promise<Project[]> {
        return this._projectRepo.findByOrg(orgId)
    }
}   