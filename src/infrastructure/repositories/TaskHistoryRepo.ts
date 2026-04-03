import { injectable } from "inversify";
import { ITaskHistoryRepo } from "../../application/interface/repositories/ITaskHistoryRepo";
import { ITaskHistoryDoc, TaskHistoryModel } from "../models/TaskHistoryModel";
import { TaskHistory } from "../../domain/entities/TaskHistory";
import { BaseRepository } from "./BaseRepo";

@injectable()
export class TaskHistoryRepo
  extends BaseRepository<TaskHistory, ITaskHistoryDoc>
  implements ITaskHistoryRepo
{
  constructor() {
    super(TaskHistoryModel);
  }

  protected toDomain(doc: ITaskHistoryDoc): TaskHistory {
    return doc.toObject({ virtuals: true }) as TaskHistory;
  }

  async findByTaskId(taskId: string): Promise<TaskHistory[]> {
    const historyLogs = await TaskHistoryModel.find({ taskId }).sort({
      createdAt: -1,
    });
    return historyLogs.map((log) => this.toDomain(log));
  }

  async deleteByTaskId(taskId: string): Promise<boolean> {
    return await this.deleteMany({ taskId: taskId });
  }
}
