import { Project } from "../../../domain/entities/Project";

export interface IGetProjectByIdUseCase {
  execute(projectId: string): Promise<Project | null>;
}
