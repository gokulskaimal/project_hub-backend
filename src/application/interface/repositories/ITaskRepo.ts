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
  findPaginatedByAssignee(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<Task[]>;
  countByAssignee(userId: string): Promise<number>;
  findPaginatedByOrg(
    orgId: string,
    limit: number,
    offset: number,
  ): Promise<Task[]>;
  countByOrg(orgId: string): Promise<number>;
  findPaginatedByProject(
    projectId: string,
    limit: number,
    offset: number,
    filters?: {
      epicId?: string;
      parentTaskId?: string;
      isInBacklog?: boolean;
      type?: string;
    },
  ): Promise<Task[]>;
  countByProject(
    projectId: string,
    filters?: {
      epicId?: string;
      parentTaskId?: string;
      isInBacklog?: boolean;
      type?: string;
    },
  ): Promise<number>;

  findAllByProject(
    projectId: string,
    filters?: {
      epicId?: string;
      parentTaskId?: string;
      isInBacklog?: boolean;
      type?: string;
    },
  ): Promise<Task[]>;

  findByParent(parentId: string): Promise<Task[]>;
  findByEpic(epicId: string): Promise<Task[]>;
}
