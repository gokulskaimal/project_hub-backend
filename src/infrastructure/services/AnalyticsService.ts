import { injectable, inject } from "inversify";
import {
  IAnalyticsService,
  UserStats,
  OrgStats,
} from "../../application/interface/services/IAnalyticsService";
import { IAnalyticsRepo } from "../../application/interface/repositories/IAnalyticsRepo";
import { TYPES } from "../container/types";
import { OrganizationStatus } from "../../domain/entities/Organization";

@injectable()
export class AnalyticsService implements IAnalyticsService {
  constructor(
    @inject(TYPES.IAnalyticsRepo)
    private readonly _analyticsRepo: IAnalyticsRepo,
  ) {}

  async getUserStats(): Promise<UserStats> {
    return await this._analyticsRepo.getGlobalUserStats();
  }

  async getOrgStats(): Promise<OrgStats> {
    const stats = await this._analyticsRepo.getOrgStats();

    const byStatus: Record<string, number> = {};
    let total = 0;
    let active = 0;
    let inactive = 0;

    stats.statusDistribution.forEach((s) => {
      byStatus[s.status] = s.count;
      total += s.count;
      if (s.status === OrganizationStatus.ACTIVE) active = s.count;
      if (s.status === OrganizationStatus.INACTIVE) inactive = s.count;
    });

    return { total, active, inactive, byStatus };
  }
}
