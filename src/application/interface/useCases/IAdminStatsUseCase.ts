import { AdminDashboardStatsDTO, AdminReportDTO } from "../../dto/StatsDTO";

export interface IAdminStatsUseCase {
  getDashboardStats(): Promise<AdminDashboardStatsDTO>;
  getReports(): Promise<AdminReportDTO>;
}
