import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ITaskRepo } from "../interface/repositories/ITaskRepo";
import { IProjectRepo } from "../interface/repositories/IProjectRepo";
import { ILogger } from "../interface/services/ILogger";
import { IGetManagerAnalyticsUseCase } from "../interface/useCases/IGetManagerAnalyticsUseCase";
import { TimeFrame } from "../../utils/DateUtils";

@injectable()
export class GetManagerAnalyticsUseCase implements IGetManagerAnalyticsUseCase {
  constructor(
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
  ) {}

  async execute(orgId: string, timeFrame?: TimeFrame) {
    this._logger.info(
      `Fetching analytics for org ${orgId} with timeframe ${timeFrame}`,
    );

    const [topPerformers, taskDistribution, projectStatus, monthlyVelocity] =
      await Promise.all([
        this._taskRepo.getTopPerformers(orgId, 5, timeFrame),
        this._taskRepo.getTasksStatusDistribution(orgId, undefined, timeFrame),
        this._projectRepo.getProjectStats(orgId),
        this._taskRepo.getMonthlyVelocity(orgId, undefined, timeFrame),
      ]);

    return {
      performance: topPerformers,
      tasks: taskDistribution,
      projects: projectStatus,
      velocity: monthlyVelocity,
    };
  }
}
