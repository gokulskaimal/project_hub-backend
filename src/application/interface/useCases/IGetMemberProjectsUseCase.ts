import { Project } from "../../../domain/entities/Project";

export interface IGetMemberProjectsUseCase {
  execute(userId: string): Promise<Project[]>;
}
