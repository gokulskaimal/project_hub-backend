import { Task } from "../../../domain/entities/Task";

export interface IGetTaskUseCase {
  execute(
    projectId: string,
    requesterId: string,
    filters?: { epicId?: string; parentTaskId?: string },
  ): Promise<Task[]>;
  executePaginated(
    projectId: string,
    requesterId: string,
    limit: number,
    offset: number,
  ): Promise<{ tasks: Task[]; total: number }>;
}

export interface IGetTaskByIdUseCase {
  execute(id: string, requesterId: string): Promise<Task>;
}
