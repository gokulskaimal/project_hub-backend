import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IAnalyticsService } from "../../application/interface/services/IAnalyticsService";
import { IAdminStatsUseCase } from "../interface/useCases/IAdminStatsUseCase";

@injectable()
export class AdminStatsUseCase implements IAdminStatsUseCase {
  constructor(
    @inject(TYPES.IAnalyticsService)
    private readonly _analyticsService: IAnalyticsService,
  ) {}

  async getDashboardStats() {
    const [userStats, orgStats] = await Promise.all([
      this._analyticsService.getUserStats(),
      this._analyticsService.getOrgStats(),
    ]);
    return { users: userStats, organizations: orgStats };
  }

  async getReports() {
    const [userStats, orgStats] = await Promise.all([
      this._analyticsService.getUserStats(),
      this._analyticsService.getOrgStats(),
    ]);

    return {
      overview: {
        totalUsers: userStats.total,
        totalOrganizations: orgStats.total,
      },
      users: userStats,
      organizations: orgStats,
    };
  }
}
