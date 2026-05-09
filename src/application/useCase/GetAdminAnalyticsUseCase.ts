import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IAnalyticsRepo } from "../interface/repositories/IAnalyticsRepo";
import { IGetAdminAnalyticsUseCase } from "../interface/useCases/IGetAdminAnalyticsUseCase";
import { TimeFrame } from "../../utils/DateUtils";

@injectable()
export class GetAdminAnalyticsUseCase implements IGetAdminAnalyticsUseCase {
  constructor(
    @inject(TYPES.IAnalyticsRepo) private _analyticsRepo: IAnalyticsRepo,
  ) {}

  async execute(
    timeFrame: TimeFrame = "YEAR",
  ): Promise<Record<string, unknown>> {
    const [revenueGrowth, orgStats] = await Promise.all([
      this._analyticsRepo.getRevenueStats(undefined, timeFrame),
      this._analyticsRepo.getOrgStats(),
    ]);

    const totalOrgs = orgStats.statusDistribution.reduce(
      (acc: number, s: { count: number }) => acc + s.count,
      0,
    );

    return {
      revenue: revenueGrowth,
      plans: orgStats.planPerformance, // Switched to Org distribution
      organizations: {
        total: totalOrgs,
        distribution: orgStats.statusDistribution,
      },
    };
  }
}
