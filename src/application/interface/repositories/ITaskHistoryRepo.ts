import { TaskHistory } from "../../../domain/entities/TaskHistory";

export interface ITaskHistoryRepo {
  create(history: TaskHistory): Promise<TaskHistory>;
  findByTaskId(taskId: string): Promise<TaskHistory[]>;
  deleteByTaskId(taskId: string): Promise<boolean>;
}
