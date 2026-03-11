export interface TaskHistory {
  id?: string;
  taskId: string;
  userId: string;
  action:
    | "CREATED"
    | "STATUS_CHANGED"
    | "ASSIGNEE_CHANGED"
    | "SPRINT_CHANGED"
    | "UPDATED";
  details?: string;
  previousValue?: string;
  newValue?: string;
  createdAt: Date;
}
