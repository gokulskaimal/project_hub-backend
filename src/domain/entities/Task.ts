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
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "BACKLOG";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  type: "STORY" | "BUG" | "TASK";
  parentTaskId?: string;
  dependencies?: TaskDependency[];
  storyPoints?: number;
  sprintId?: string | null;
  sprintAssignedAt?: Date;
  dueDate?: Date;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  createdBy?: string;
  timeLogs?: TimeLog[];
  totalTimeSpent?: number;
  attachments?: Array<{
    name: string;
    url: string;
    size?: number;
    type?: string;
  }>;
  comments?: TaskComment[];
}
