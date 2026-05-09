import { Sprint } from "../../domain/entities/Sprint";

export interface SprintCreatedPayload {
  sprint: Sprint;
  creatorId: string;
}

export interface SprintUpdatedPayload {
  oldSprint: Sprint;
  updatedSprint: Sprint;
  updaterId: string;
  changes: Partial<Sprint>;
}

export interface SprintDeletedPayload {
  sprintId: string;
  projectId: string;
  orgId: string;
  deleterId: string;
  sprintTitle: string;
}

export const SPRINT_EVENTS = {
  CREATED: "sprint:created",
  UPDATED: "sprint:updated",
  DELETED: "sprint:deleted",
} as const;
