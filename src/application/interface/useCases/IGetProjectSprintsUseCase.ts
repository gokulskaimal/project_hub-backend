import { Sprint } from "../../../domain/entities/Sprint";

export interface IGetProjectSprintsUseCase {
  execute(projectId: string): Promise<Sprint[]>;
}
