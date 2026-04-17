import { Task } from "../../domain/entities/Task";

export interface TaskUpdatedPayload {
  oldTask: Task;
  updatedTask: Task;
  updaterId?: string;
  changes: Partial<Task>;
}

export interface TaskCreatedPayload {
  task: Task;
  creatorId: string;
}

export interface TaskDeletedPayload {
  taskId: string;
  projectId: string;
  orgId: string;
  deleterId: string;
  taskTitle: string;
}

export const TASK_EVENTS = {
  UPDATED: "task:updated",
  CREATED: "task:created",
  DELETED: "task:deleted",
} as const;
