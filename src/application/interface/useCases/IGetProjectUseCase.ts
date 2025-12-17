import { Project } from "../../../domain/entities/Project";

export interface IGetProjectUseCase{
    execute(orgId : string) : Promise<Project[]>
}