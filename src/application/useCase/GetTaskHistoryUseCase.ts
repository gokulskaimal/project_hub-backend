import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IGetTaskHistoryUseCase } from "../interface/useCases/IGetTaskHistoryUseCase";
import { ITaskHistoryRepo } from "../../infrastructure/interface/repositories/ITaskHistoryRepo";
import { TaskHistory } from "../../domain/entities/TaskHistory";

@injectable()
export class GetTaskHistoryUseCase implements IGetTaskHistoryUseCase {
  constructor(
    @inject(TYPES.ITaskHistoryRepo) private _historyRepo: ITaskHistoryRepo,
  ) {}

  async execute(taskId: string): Promise<TaskHistory[]> {
    return this._historyRepo.findByTaskId(taskId);
  }
}
