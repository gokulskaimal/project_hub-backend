import { Project } from "../../../domain/entities/Project";

export interface IGetMemberProjectsUseCase {
  execute(userId: string, requesterId: string): Promise<Project[]>;
}
