import { Project } from "../../../domain/entities/Project";

export interface IGetMemberProjectsUseCase {
  execute(userId: string, requesterId: string): Promise<Project[]>;
  executePaginated(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<{ projects: Project[]; total: number }>;
}
