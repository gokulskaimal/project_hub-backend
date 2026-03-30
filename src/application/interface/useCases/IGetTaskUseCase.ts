import { Task } from "../../../domain/entities/Task";

export interface IGetTaskUseCase {
  execute(projectId: string, requesterId: string): Promise<Task[]>;
}

export interface IGetTaskByIdUseCase {
  execute(id: string, requesterId: string): Promise<Task>;
}
