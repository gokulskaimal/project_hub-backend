import { Project } from "../../../domain/entities/Project";

export interface IUpdateProjectUseCase{
    execute(id : string , data : Partial<Project>) : Promise<Project> 

}