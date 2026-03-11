import { Task, TaskComment } from "../../domain/entities/Task";

export interface TaskDTO {
  id: string;
  projectId: string;
  orgId: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  type: string;
  storyPoints: number;
  sprintId?: string;
  sprintAssignedAt?: string;
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  attachments?: string[];
  comments?: TaskComment[];
  parentTaskId?: string;
  dependencies?: {
    taskId: string;
    type: "BLOCKS" | "IS_BLOCKED_BY" | "RELATES_TO";
  }[];
  timeLogs?: {
    userId: string;
    startTime: Date;
    endTime?: Date;
    duration?: number;
  }[];
  totalTimeSpent?: number;
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
    type: task.type,
    storyPoints: task.storyPoints || 0,
    sprintId: task.sprintId || undefined,
    sprintAssignedAt: toIso(task.sprintAssignedAt),
    assignedTo: task.assignedTo,
    dueDate: toIso(task.dueDate),
    createdAt: toIso(task.createdAt) as string,
    updatedAt: toIso(task.updatedAt),
    completedAt: toIso(task.completedAt),
    attachments: task.attachments || [],
    comments: task.comments || [],
    parentTaskId: task.parentTaskId,
    dependencies: task.dependencies || [],
    timeLogs: task.timeLogs || [],
    totalTimeSpent: task.totalTimeSpent || 0,
  };
}
