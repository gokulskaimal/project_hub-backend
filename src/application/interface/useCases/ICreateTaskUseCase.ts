import { Task } from "../../../domain/entities/Task";

export interface ICreateTaskUseCase{
    execute(data : Partial<Task>) : Promise<Task>
}