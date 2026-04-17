export interface TimeLog {
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

export interface TaskComment {
  id?: string;
  userId: string;
  text: string;
  createdAt: Date;
}

export interface TaskDependency {
  taskId: string;
  type: "BLOCKS" | "IS_BLOCKED_BY" | "RELATES_TO";
}

export interface Task {
  id: string;
  projectId: string;
  orgId: string;
  taskKey?: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "BACKLOG";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  type: "STORY" | "BUG" | "TASK" | "EPIC";
  epicId?: string | null;
  parentTaskId?: string | null;
  dependencies?: TaskDependency[] | null;
  storyPoints?: number | null;
  sprintId?: string | null;
  sprintAssignedAt?: Date | null;
  dueDate?: Date | null;
  assignedTo?: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
  createdBy?: string;
  timeLogs?: TimeLog[] | null;
  totalTimeSpent?: number | null;
  attachments?: Array<{
    name: string;
    url: string;
    size?: number;
    type?: string;
  }>;
  acceptanceCriteria?: Array<{ text: string; completed: boolean }>;
  comments?: TaskComment[];
}

export const TASK_TYPES = ["STORY", "BUG", "TASK", "EPIC"] as const;
