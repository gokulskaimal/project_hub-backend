import { Task } from "../../../domain/entities/Task";
import { IBaseRepository } from "./IBaseRepo";

export interface ITaskRepo extends IBaseRepository<Task> {
  findByProject(projectId: string): Promise<Task[]>;
  findByAssignee(userId: string, orgId?: string): Promise<Task[]>;
  findByOrganization(orgId: string): Promise<Task[]>;
  deleteSubtasks(parentId: string): Promise<boolean>;
  countBySprint(sprintId: string): Promise<number>;
  countBySprintAssignedAtRange(
    sprintId: string,
    start: Date,
    end: Date,
  ): Promise<number>;
  sumDonePointsByUserInRange(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<number>;
  sumDonePointsByProjectInRange(
    projectId: string,
    start: Date,
    end: Date,
  ): Promise<number>;
}
