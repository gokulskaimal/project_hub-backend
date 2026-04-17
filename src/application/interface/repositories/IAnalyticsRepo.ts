import { TimeFrame } from "../../../utils/DateUtils";

export interface IAnalyticsRepo {
  getGlobalUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    pending: number;
    verified: number;
    unverified: number;
    byRole: Record<string, number>;
  }>;

  getOrgStats(): Promise<{
    statusDistribution: Array<{ status: string; count: number }>;
    planPerformance: Array<{ planName: string; count: number }>;
  }>;

  getOrgMemberStats(orgId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
  }>;

  // Task & Performance Stats (Moved from TaskRepo)
  getTaskStatusDistribution(
    orgId: string,
    userId?: string,
    timeFrame?: TimeFrame,
  ): Promise<Array<{ status: string; count: number }>>;
  getMonthlyVelocity(
    orgId: string,
    userId?: string,
    timeFrame?: TimeFrame,
  ): Promise<Array<{ month: string; points: number }>>;
  getTopPerformers(
    orgId: string,
    limit: number,
    timeFrame?: TimeFrame,
  ): Promise<Record<string, unknown>[]>;
  getDonePointsInRange(
    scope: "user" | "project",
    id: string,
    start: Date,
    end: Date,
  ): Promise<number>;

  getProjectStats(orgId: string): Promise<Record<string, number>>;
  getProjectProgressReport(orgId: string): Promise<Record<string, unknown>[]>;
  getEpicProgressReport(projectId: string): Promise<Record<string, unknown>[]>;
  getRevenueStats(
    orgId?: string,
    timeFrame?: TimeFrame,
  ): Promise<Array<{ month: string; amount: number }>>;

  getInvoicePlanPerformance(): Promise<
    Array<{ planName: string; count: number; totalRevenue: number }>
  >;

  getInvitationStats(orgId?: string): Promise<Record<string, number>>;

  // Cross-collection Enrichment
  getUserCountsByOrgIds(orgIds: string[]): Promise<Map<string, number>>;
}
