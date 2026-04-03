import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ITaskRepo } from "../interface/repositories/ITaskRepo";
import { IGetMemberAnalyticsUseCase } from "../interface/useCases/IGetMemberAnalyticsUseCase";
import { TimeFrame } from "../../utils/DateUtils";

@injectable()
export class GetMemberAnalyticsUseCase implements IGetMemberAnalyticsUseCase {
  constructor(@inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo) {}

  async execute(
    userId: string,
    timeFrame: TimeFrame = "YEAR",
  ): Promise<Record<string, unknown>> {
    //task distribution and weekly velocity
    const [statusDistribution, velocity] = await Promise.all([
      this._taskRepo.getTasksStatusDistribution("", userId, timeFrame), // userId filtered
      this._taskRepo.getMonthlyVelocity("", userId, timeFrame), // userId filtered
    ]);

    return {
      taskDistribution: statusDistribution,
      velocity: velocity,
    };
  }
}
