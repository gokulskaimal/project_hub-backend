import { Task } from "../../../domain/entities/Task";

export interface IDeleteTaskUseCase{
    execute(id : string) : Promise<boolean>
}