import { Invoice } from "../../../domain/entities/Invoice";

export interface IInvoiceRepo {
  create(data: Partial<Invoice>): Promise<Invoice>;
  findById(id: string): Promise<Invoice | null>;
  findByOrgId(
    orgId: string,
    skip: number,
    limit: number,
  ): Promise<{ items: Invoice[]; total: number }>;
  findAllPaginated(
    skip: number,
    limit: number,
    search?: string,
    status?: string,
    sort?: string,
    planType?: string,
  ): Promise<{ items: Invoice[]; total: number; totalRevenue: number }>;
}
