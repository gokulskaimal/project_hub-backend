import { Task } from "../../../domain/entities/Task";
import { IBaseRepository } from "./IBaseRepo";

export interface ITaskRepo extends IBaseRepository<Task> {
  findByProject(projectId: string): Promise<Task[]>;
  findByAssignee(userId: string): Promise<Task[]>;
}
