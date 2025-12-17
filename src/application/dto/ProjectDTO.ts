import { Project } from "../../domain/entities/Project";

export interface ProjectDTO {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt?: string;
  orgId: string;
  priority?: string;
  tags?: string[];
  teamMemberIds?: string[];
}

export function toProjectDTO(project: Project): ProjectDTO {
  const toIso = (d?: Date | string): string | undefined => 
    d ? new Date(d).toISOString() : undefined;

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    startDate: toIso(project.startDate),
    endDate: toIso(project.endDate),
    createdAt: toIso(project.createdAt) as string, // CreatedAt should always exist
    updatedAt: toIso(project.updatedAt),
    orgId: project.orgId,
    priority: project.priority,
    tags: project.tags,
    teamMemberIds: project.teamMemberIds
  };
}
