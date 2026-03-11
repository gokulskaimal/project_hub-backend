import { TaskHistory } from "../../../domain/entities/TaskHistory";

export interface IGetTaskHistoryUseCase {
  execute(taskId: string): Promise<TaskHistory[]>;
}
