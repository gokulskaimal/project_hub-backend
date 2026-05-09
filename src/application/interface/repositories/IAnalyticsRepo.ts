import { TimeFrame } from "../../../utils/DateUtils";

export interface StatusDistributionItem {
  status: string;
  count: number;
}

export interface PerformanceMetric {
  userId: string;
  name: string;
  storyPoints: number;
  taskCount: number;
}

export interface MonthlyVelocityItem {
  month: string;
  points: number;
}

export interface ProjectHealthItem {
  id: string;
  name: string;
  overdueCount: number;
  totalActiveTasks: number;
  health: "GREEN" | "AMBER" | "RED";
}

export interface MemberWorkloadItem {
  name: string;
  taskCount: number;
  totalPoints: number;
}

export interface ProjectProgressItem {
  id: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
}

export interface EpicProgressItem {
  id: string;
  title: string;
  status: string;
  totalStories: number;
  completedStories: number;
  progress: number;
}

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
    statusDistribution: StatusDistributionItem[];
    planPerformance: Array<{ planName: string; count: number }>;
  }>;

  getOrgMemberStats(orgId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
  }>;

  // Task & Performance Stats
  getTaskStatusDistribution(
    orgId: string,
    userId?: string,
    timeFrame?: TimeFrame,
  ): Promise<StatusDistributionItem[]>;

  getMonthlyVelocity(
    orgId: string,
    userId?: string,
    timeFrame?: TimeFrame,
  ): Promise<MonthlyVelocityItem[]>;

  getTopPerformers(
    orgId: string,
    limit: number,
    timeFrame?: TimeFrame,
  ): Promise<PerformanceMetric[]>;

  getDonePointsInRange(
    scope: "user" | "project",
    id: string,
    start: Date,
    end: Date,
  ): Promise<number>;

  getProjectStats(orgId: string): Promise<Record<string, number>>;
  getProjectProgressReport(orgId: string): Promise<ProjectProgressItem[]>;
  getEpicProgressReport(projectId: string): Promise<EpicProgressItem[]>;
  getRevenueStats(
    orgId?: string,
    timeFrame?: TimeFrame,
  ): Promise<Array<{ month: string; amount: number }>>;

  getInvoicePlanPerformance(): Promise<
    Array<{ planName: string; count: number; totalRevenue: number }>
  >;

  getInvitationStats(orgId?: string): Promise<Record<string, number>>;
  getProjectHealthReport(orgId: string): Promise<ProjectHealthItem[]>;
  getMemberWorkloadReport(orgId: string): Promise<MemberWorkloadItem[]>;

  // Cross-collection Enrichment
  getUserCountsByOrgIds(orgIds: string[]): Promise<Map<string, number>>;
}
