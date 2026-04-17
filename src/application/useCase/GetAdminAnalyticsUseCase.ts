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
    const [revenueGrowth, planPerformance, orgStats] = await Promise.all([
      this._analyticsRepo.getRevenueStats(undefined, timeFrame),
      this._analyticsRepo.getInvoicePlanPerformance(),
      this._analyticsRepo.getOrgStats(),
    ]);

    const totalOrgs = orgStats.statusDistribution.reduce(
      (acc: number, s: { count: number }) => acc + s.count,
      0,
    );

    return {
      revenue: revenueGrowth,
      plans: planPerformance,
      organizations: {
        total: totalOrgs,
        distribution: orgStats.statusDistribution,
      },
    };
  }
}
