import { Task } from "../../../domain/entities/Task";

export interface IGetMemberTasksUseCase {
  execute(userId: string, requesterId: string): Promise<Task[]>;
}
