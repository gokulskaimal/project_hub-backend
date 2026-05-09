import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IAnalyticsRepo } from "../interface/repositories/IAnalyticsRepo";
import { IGetMemberAnalyticsUseCase } from "../interface/useCases/IGetMemberAnalyticsUseCase";
import { TimeFrame } from "../../utils/DateUtils";

@injectable()
export class GetMemberAnalyticsUseCase implements IGetMemberAnalyticsUseCase {
  constructor(
    @inject(TYPES.IAnalyticsRepo) private _analyticsRepo: IAnalyticsRepo,
  ) {}

  async execute(
    userId: string,
    timeFrame: TimeFrame = "YEAR",
  ): Promise<Record<string, unknown>> {
    //task distribution and monthly velocity
    const [statusDistribution, velocity] = await Promise.all([
      this._analyticsRepo.getTaskStatusDistribution("", userId, timeFrame), // userId filtered
      this._analyticsRepo.getMonthlyVelocity("", userId, timeFrame), // userId filtered
    ]);

    return {
      taskDistribution: statusDistribution,
      velocity: velocity,
    };
  }
}
