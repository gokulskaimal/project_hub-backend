import { Task } from "../../domain/entities/Task";

export interface TaskDTO {
  id: string;
  projectId: string;
  orgId: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export function toTaskDTO(task: Task): TaskDTO {
  const toIso = (d?: Date | string): string | undefined => 
    d ? new Date(d).toISOString() : undefined;

  return {
    id: task.id,
    projectId: task.projectId,
    orgId: task.orgId,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assignedTo: task.assignedTo,
    dueDate: toIso(task.dueDate),
    createdAt: toIso(task.createdAt) as string,
    updatedAt: toIso(task.updatedAt),
  };
}
