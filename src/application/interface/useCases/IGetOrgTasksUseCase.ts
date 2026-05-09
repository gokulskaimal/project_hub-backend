import { Task } from "../../../domain/entities/Task";

export interface IGetOrgTasksUseCase {
  execute(orgId: string, requesterId: string): Promise<Task[]>;
  executePaginated(
    orgId: string,
    limit: number,
    offset: number,
  ): Promise<{ tasks: Task[]; total: number }>;
}
