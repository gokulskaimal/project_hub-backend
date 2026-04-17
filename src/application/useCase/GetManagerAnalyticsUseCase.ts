import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IAnalyticsRepo } from "../interface/repositories/IAnalyticsRepo";
import { ILogger } from "../interface/services/ILogger";
import { IGetManagerAnalyticsUseCase } from "../interface/useCases/IGetManagerAnalyticsUseCase";
import { TimeFrame } from "../../utils/DateUtils";

@injectable()
export class GetManagerAnalyticsUseCase implements IGetManagerAnalyticsUseCase {
  constructor(
    @inject(TYPES.IAnalyticsRepo) private _analyticsRepo: IAnalyticsRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
  ) {}

  async execute(orgId: string, timeFrame?: TimeFrame) {
    this._logger.info(
      `Fetching analytics for org ${orgId} with timeframe ${timeFrame}`,
    );

    const [topPerformers, taskDistribution, projectStatus, monthlyVelocity] =
      await Promise.all([
        this._analyticsRepo.getTopPerformers(orgId, 5, timeFrame),
        this._analyticsRepo.getTaskStatusDistribution(
          orgId,
          undefined,
          timeFrame,
        ),
        this._analyticsRepo.getProjectStats(orgId),
        this._analyticsRepo.getMonthlyVelocity(orgId, undefined, timeFrame),
      ]);

    return {
      performance: topPerformers,
      tasks: taskDistribution,
      projects: projectStatus,
      velocity: monthlyVelocity,
    };
  }
}
