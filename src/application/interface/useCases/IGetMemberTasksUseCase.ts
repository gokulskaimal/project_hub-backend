import { Task } from "../../../domain/entities/Task";

export interface IGetMemberTasksUseCase {
  execute(userId: string): Promise<Task[]>;
}
