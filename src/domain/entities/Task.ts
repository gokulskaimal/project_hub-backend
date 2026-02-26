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
  storyPoints?: number;
  sprintId?: string | null;
  dueDate?: Date;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  timeLogs?: TimeLog[];
  totalTimeSpent?: number;
  attachments?: string[];
  comments?: TaskComment[];
}
