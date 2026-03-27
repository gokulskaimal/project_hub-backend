import { injectable } from "inversify";
import { ITimeTrackingService } from "../interface/services/ITimeTrackingService";
import { Task } from "../entities/Task";

@injectable()
export class TimeTrackingService implements ITimeTrackingService {
  public updateTimeLogs(
    task: Task,
    newStatus: string,
    updaterId: string,
  ): void {
    const isAssignee = task.assignedTo === updaterId;
    if (!task.timeLogs) {
      task.timeLogs = [];
    }

    // Start Timer
    if (newStatus === "IN_PROGRESS" && isAssignee) {
      const runningLog = task.timeLogs.find(
        (log) => log.userId === updaterId && !log.endTime,
      );
      if (!runningLog) {
        task.timeLogs.push({ userId: updaterId, startTime: new Date() });
      }
    }

    // Stop Timer
    if (
      task.status === "IN_PROGRESS" &&
      newStatus !== "IN_PROGRESS" &&
      isAssignee
    ) {
      const runningIndex = task.timeLogs.findIndex(
        (log) => log.userId === updaterId && !log.endTime,
      );

      if (runningIndex !== -1) {
        const log = task.timeLogs[runningIndex];
        const now = new Date();
        log.endTime = now;

        log.duration = now.getTime() - new Date(log.startTime).getTime();
        task.totalTimeSpent = (task.totalTimeSpent || 0) + log.duration;
        task.timeLogs[runningIndex] = log;
      }
    }
  }
}
