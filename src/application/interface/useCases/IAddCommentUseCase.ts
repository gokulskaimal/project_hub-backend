import { Task } from "../../../domain/entities/Task";

export interface IAddCommentUseCase {
  execute(taskId: string, userId: string, text: string): Promise<Task>;
}
