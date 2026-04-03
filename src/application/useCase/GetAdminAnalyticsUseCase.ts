import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IInvoiceRepo } from "../interface/repositories/IInvoiceRepo";
import { IOrgRepo } from "../interface/repositories/IOrgRepo";
import { IGetAdminAnalyticsUseCase } from "../interface/useCases/IGetAdminAnalyticsUseCase";
import { TimeFrame } from "../../utils/DateUtils";

@injectable()
export class GetAdminAnalyticsUseCase implements IGetAdminAnalyticsUseCase {
  constructor(
    @inject(TYPES.IInvoiceRepo) private _invoiceRepo: IInvoiceRepo,
    @inject(TYPES.IOrgRepo) private _orgRepo: IOrgRepo,
  ) {}

  async execute(
    timeFrame: TimeFrame = "YEAR",
  ): Promise<Record<string, unknown>> {
    const [revenueGrowth, planPerformance, totalOrgs, statusDistribution] =
      await Promise.all([
        this._invoiceRepo.getRevenueGrowth(timeFrame),
        this._orgRepo.getPlanPerformance(),
        this._orgRepo.count(),
        this._orgRepo.getStatusDistribution(),
      ]);

    return {
      revenue: revenueGrowth,
      plans: planPerformance,
      organizations: {
        total: totalOrgs,
        distribution: statusDistribution,
      },
    };
  }
}
