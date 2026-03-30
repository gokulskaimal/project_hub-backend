import { injectable, inject } from "inversify";
import {
  IAnalyticsService,
  UserStats,
  OrgStats,
} from "../../application/interface/services/IAnalyticsService";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { IOrgRepo } from "../../application/interface/repositories/IOrgRepo";
import { TYPES } from "../container/types";
import { OrganizationStatus } from "../../domain/entities/Organization";

@injectable()
export class AnalyticsService implements IAnalyticsService {
  constructor(
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.IOrgRepo) private readonly _orgRepo: IOrgRepo,
  ) {}

  async getUserStats(): Promise<UserStats> {
    return await this._userRepo.getGlobalStats();
  }

  async getOrgStats(): Promise<OrgStats> {
    const [total, agg] = await Promise.all([
      this._orgRepo.count(),
      this._orgRepo.getStatusDistribution(),
    ]);

    const byStatus: Record<string, number> = {};
    let active = 0;
    let inactive = 0;

    agg.forEach((s) => {
      byStatus[s._id] = s.count;
      if (s._id === OrganizationStatus.ACTIVE) active = s.count;
      if (s._id === OrganizationStatus.INACTIVE) inactive = s.count;
    });

    return { total, active, inactive, byStatus };
  }
}
