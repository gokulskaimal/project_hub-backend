import { injectable } from "inversify";
import { ITaskHistoryRepo } from "../../application/interface/repositories/ITaskHistoryRepo";
import { TaskHistoryModel } from "../models/TaskHistoryModel";
import { TaskHistory } from "../../domain/entities/TaskHistory";
import { TaskModel } from "../models/TaskModel";

@injectable()
export class TaskHistoryRepo implements ITaskHistoryRepo {
  async create(history: TaskHistory): Promise<TaskHistory> {
    const newHistory = await TaskHistoryModel.create(history);
    return newHistory.toObject({ virtuals: true });
  }

  async findByTaskId(taskId: string): Promise<TaskHistory[]> {
    const historyLogs = await TaskHistoryModel.find({ taskId }).sort({
      createdAt: -1,
    });
    return historyLogs.map((log) => log.toObject({ virtuals: true }));
  }

  async deleteByTaskId(taskId: string): Promise<boolean> {
    await TaskModel.deleteMany({ taskId });
    return true;
  }
}
