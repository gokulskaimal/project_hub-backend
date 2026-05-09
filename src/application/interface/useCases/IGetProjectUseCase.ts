import { Project } from "../../../domain/entities/Project";

export interface IGetProjectUseCase {
  execute(orgId: string, requesterId: string): Promise<Project[]>;
  executePaginated(
    limit: number,
    offset: number,
    filters: {
      orgId: string;
      status?: string;
      priority?: string;
      searchTerm?: string;
    },
  ): Promise<{ projects: Project[]; total: number }>;
}
