import { Task } from "../../../domain/entities/Task";

export interface IGetTaskUseCase{
    execute(projectId : string) : Promise<Task[]>
}