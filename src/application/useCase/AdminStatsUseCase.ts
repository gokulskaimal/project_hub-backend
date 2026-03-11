import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { IOrgRepo } from "../../infrastructure/interface/repositories/IOrgRepo";
import { IAdminStatsUseCase } from "../interface/useCases/IAdminStatsUseCase";

@injectable()
export class AdminStatsUseCase implements IAdminStatsUseCase {
  constructor(
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.IOrgRepo) private readonly _orgRepo: IOrgRepo,
  ) {}

  async getDashboardStats() {
    const [userStats, orgStats] = await Promise.all([
      this._userRepo.getStats(),
      this._orgRepo.getStats(),
    ]);
    return { users: userStats, organizations: orgStats };
  }

  async getReports() {
    const [userStats, orgStats] = await Promise.all([
      this._userRepo.getStats(),
      this._orgRepo.getStats(),
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
