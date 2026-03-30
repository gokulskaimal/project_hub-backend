import { TaskHistory } from "../../domain/entities/TaskHistory";

export interface TaskHistoryDTO {
  id?: string;
  taskId: string;
  userId: string;
  action: string;
  details?: string;
  previousValue?: string;
  newValue?: string;
  createdAt: string;
}

export function toTaskHistoryDTO(history: TaskHistory): TaskHistoryDTO {
  return {
    id: history.id,
    taskId: history.taskId,
    userId: history.userId,
    action: history.action,
    details: history.details,
    previousValue: history.previousValue,
    newValue: history.newValue,
    createdAt: history.createdAt.toISOString(),
  };
}
