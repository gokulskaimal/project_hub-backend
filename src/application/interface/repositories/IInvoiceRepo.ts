import { Invoice } from "../../../domain/entities/Invoice";
import { TimeFrame } from "../../../utils/DateUtils";

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

  getRevenueGrowth(
    timeFrame: TimeFrame,
  ): Promise<Array<{ month: string; amount: number }>>;

  getPlanPerformance(): Promise<
    Array<{ planName: string; count: number; totalRevenue: number }>
  >;
}
