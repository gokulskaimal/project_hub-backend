import { Project } from "../../../domain/entities/Project";

export interface ICreateProjectUseCase{
    execute(userId: string, orgId : string , data : Partial<Project>) : Promise<Project>
}