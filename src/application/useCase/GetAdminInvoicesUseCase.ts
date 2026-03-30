import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IInvoiceRepo } from "../../application/interface/repositories/IInvoiceRepo";
import { IGetAdminInvoicesUseCase } from "../interface/useCases/IGetAdminInvoicesUseCase";
import { Invoice } from "../../domain/entities/Invoice";

@injectable()
export class GetAdminInvoicesUseCase implements IGetAdminInvoicesUseCase {
  constructor(@inject(TYPES.IInvoiceRepo) private _invoiceRepo: IInvoiceRepo) {}

  async execute(
    requesterId: string,
    page: number,
    limit: number,
    search?: string,
    status?: string,
    sort?: string,
    planType?: string,
  ): Promise<{
    items: Invoice[];
    total: number;
    totalPages: number;
    totalRevenue: number;
  }> {
    const skip = (page - 1) * limit;
    const result = await this._invoiceRepo.findAllPaginated(
      skip,
      limit,
      search,
      status,
      sort,
      planType,
    );

    return {
      items: result.items,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
      totalRevenue: result.totalRevenue,
    };
  }
}
