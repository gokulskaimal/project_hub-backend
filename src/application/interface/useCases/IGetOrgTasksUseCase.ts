import { Task } from "../../../domain/entities/Task";

export interface IGetOrgTasksUseCase {
  execute(orgId: string, requesterId: string): Promise<Task[]>;
}
