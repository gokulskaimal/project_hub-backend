import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IInvoiceRepo } from "../../application/interface/repositories/IInvoiceRepo";
import { IGetOrgInvoicesUseCase } from "../interface/useCases/IGetOrgInvoicesUseCase";
import { Invoice } from "../../domain/entities/Invoice";
import { ISecurityService } from "../../application/interface/services/ISecurityService";

@injectable()
export class GetOrgInvoicesUseCase implements IGetOrgInvoicesUseCase {
  constructor(
    @inject(TYPES.IInvoiceRepo) private _invoiceRepo: IInvoiceRepo,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(
    orgId: string,
    page: number,
    limit: number,
    requesterId: string,
  ): Promise<{ items: Invoice[]; total: number; totalPages: number }> {
    await this._securityService.validateOrgAccess(requesterId, orgId);

    const skip = (page - 1) * limit;
    const result = await this._invoiceRepo.findByOrgId(orgId, skip, limit);

    return {
      items: result.items,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    };
  }
}
