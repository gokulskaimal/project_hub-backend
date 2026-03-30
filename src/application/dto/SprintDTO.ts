import { Sprint } from "../../domain/entities/Sprint";

export interface SprintDTO {
  id: string;
  projectId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  goal?: string;
  createdAt: string;
  updatedAt: string;
}

export function toSprintDTO(sprint: Sprint): SprintDTO {
  const toIso = (d?: Date | string): string =>
    d ? new Date(d).toISOString() : new Date().toISOString();

  return {
    id: sprint.id,
    projectId: sprint.projectId,
    name: sprint.name,
    description: sprint.description,
    startDate: toIso(sprint.startDate),
    endDate: toIso(sprint.endDate),
    status: sprint.status,
    goal: sprint.goal,
    createdAt: toIso(sprint.createdAt),
    updatedAt: toIso(sprint.updatedAt),
  };
}

export function toSprintDTOArray(sprints: Sprint[]): SprintDTO[] {
  return sprints.map(toSprintDTO);
}
