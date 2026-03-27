import { Invoice } from "../../../domain/entities/Invoice";

export interface IGetOrgInvoicesUseCase {
  execute(
    orgId: string,
    page: number,
    limit: number,
    requesterId: string,
  ): Promise<{ items: Invoice[]; total: number; totalPages: number }>;
}
