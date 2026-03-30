import { Project } from "../../../domain/entities/Project";

export interface IGetProjectByIdUseCase {
  execute(projectId: string, requesterId: string): Promise<Project | null>;
}
