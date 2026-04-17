import { Project } from "../../domain/entities/Project";

export interface ProjectCreatedPayload {
  project: Project;
  creatorId: string;
}

export interface ProjectUpdatedPayload {
  oldProject: Project;
  updatedProject: Project;
  updaterId: string;
  changes: Partial<Project>;
}

export interface ProjectDeletedPayload {
  projectId: string;
  orgId: string;
  deletorId: string;
  projectTitle: string;
}

export const PROJECT_EVENTS = {
  CREATED: "project:created",
  UPDATED: "project:updated",
  DELETED: "project:deleted",
} as const;
