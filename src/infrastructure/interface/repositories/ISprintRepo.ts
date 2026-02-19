import { Sprint } from "../../../domain/entities/Sprint";
import { IBaseRepository } from "./IBaseRepo";

export interface ISprintRepo extends IBaseRepository<Sprint> {
  findByProject(projectId: string): Promise<Sprint[]>;
  findActiveSprint(projectId: string): Promise<Sprint | null>;
}
