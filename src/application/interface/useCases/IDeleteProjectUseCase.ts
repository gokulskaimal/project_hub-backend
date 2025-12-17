import { Project } from "../../../domain/entities/Project";

export interface IDeleteProjectUseCase{
    execute(id : string) : Promise<boolean>
}

