import { Task } from "../../../domain/entities/Task";
import { IBaseRepository } from "./IBaseRepo";
import { TimeFrame } from "../../../utils/DateUtils";

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
  getTopPerformers(
    orgId: string,
    limit: number,
    timeFrame?: TimeFrame,
  ): Promise<
    Array<{
      userId: string;
      name: string;
      storyPoints: number;
      taskCount: number;
    }>
  >;
  getTasksStatusDistribution(
    orgId: string,
    userId?: string,
    timeFrame?: TimeFrame,
  ): Promise<Array<{ status: string; count: number }>>;
  getMonthlyVelocity(
    orgId: string,
    userId?: string,
    timeFrame?: TimeFrame,
  ): Promise<Array<{ month: string; points: number }>>;
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
}
