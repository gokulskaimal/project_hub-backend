import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IGetTaskByIdUseCase } from "../interface/useCases/IGetTaskUseCase";
import { ITaskRepo } from "../../infrastructure/interface/repositories/ITaskRepo";
import { Task } from "../../domain/entities/Task";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";

@injectable()
export class GetTaskByIdUseCase implements IGetTaskByIdUseCase {
  constructor(@inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo) {}

  async execute(id: string): Promise<Task> {
    const task = await this._taskRepo.findById(id);
    if (!task) throw new EntityNotFoundError("Task", id);
    return task;
  }
}
