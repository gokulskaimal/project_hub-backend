import { Task } from "../../../domain/entities/Task";

export interface IUpdateTaskUseCase {
  execute(id: string, data: Partial<Task>, updaterId: string): Promise<Task>;
}
