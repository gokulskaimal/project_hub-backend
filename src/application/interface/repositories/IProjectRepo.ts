import { Project } from "../../../domain/entities/Project";
import { IBaseRepository } from "./IBaseRepo";

export interface IProjectRepo extends IBaseRepository<Project> {
  countByOrg(orgId: string): Promise<number>;
  findByOrg(orgId: string): Promise<Project[]>;
  findByTeamMember(userId: string, orgId?: string): Promise<Project[]>;
  findPaginated(
    limit: number,
    offset: number,
    filters?: {
      orgId?: string;
      status?: string;
      priority?: string;
      searchTerm?: string;
    },
  ): Promise<{
    projects: Project[];
    total: number;
  }>;
  getProjectStats(orgId: string): Promise<{
    total: number;
    active: number;
    onHold: number;
    completed: number;
  }>;

  getProjectProgressReport(
    orgId: string,
  ): Promise<
    Array<{
      name: string;
      totalTasks: number;
      completedTasks: number;
      progress: number;
    }>
  >;
}
