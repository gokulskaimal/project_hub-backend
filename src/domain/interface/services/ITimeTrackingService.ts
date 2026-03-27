import { Task } from "../../entities/Task";

export interface ITimeTrackingService {
  updateTimeLogs(task: Task, newStatus: string, updaterId: string): void;
}
