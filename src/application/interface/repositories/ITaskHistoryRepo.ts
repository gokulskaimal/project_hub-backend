import { TaskHistory } from "../../../domain/entities/TaskHistory";
import { IBaseRepository } from "./IBaseRepo";

export interface ITaskHistoryRepo extends IBaseRepository<TaskHistory> {
  findByTaskId(taskId: string): Promise<TaskHistory[]>;
  deleteByTaskId(taskId: string): Promise<boolean>;
}
