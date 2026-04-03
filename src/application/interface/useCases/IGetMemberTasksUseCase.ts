import { Task } from "../../../domain/entities/Task";

export interface IGetMemberTasksUseCase {
  execute(userId: string, requesterId: string): Promise<Task[]>;
  executePaginated(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<{ tasks: Task[]; total: number }>;
}
