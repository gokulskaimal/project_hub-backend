import { TaskHistory } from "../../../domain/entities/TaskHistory";

export interface IGetTaskHistoryUseCase {
  execute(taskId: string, requesterId: string): Promise<TaskHistory[]>;
}
