import { Invoice } from "../../../domain/entities/Invoice";

export interface IGetAdminInvoicesUseCase {
  execute(
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
  }>;
}
