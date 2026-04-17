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
  attachments?: Array<{
    name: string;
    url: string;
    size?: number;
    type?: string;
  }>;
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
    description: task.description ?? undefined,
    status: task.status,
    priority: task.priority,
    type: task.type,
    storyPoints: task.storyPoints ?? 0,
    sprintId: task.sprintId ?? undefined,
    sprintAssignedAt: toIso(task.sprintAssignedAt || undefined),
    assignedTo: task.assignedTo ?? undefined,
    dueDate: toIso(task.dueDate || undefined),
    createdAt: toIso(task.createdAt) as string,
    updatedAt: toIso(task.updatedAt),
    completedAt: toIso(task.completedAt || undefined),
    attachments: task.attachments || [],
    comments: task.comments || [],
    parentTaskId: task.parentTaskId ?? undefined,
    dependencies: task.dependencies || [],
    timeLogs: task.timeLogs || [],
    totalTimeSpent: task.totalTimeSpent ?? 0,
  };
}
