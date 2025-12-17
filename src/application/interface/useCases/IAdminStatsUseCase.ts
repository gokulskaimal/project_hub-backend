export interface IOrgStats {
  total: number;
  active: number;
  inactive: number;
  byStatus: Record<string, number>;
}

export interface IUserStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  verified: number;
  unverified: number;
  byRole: Record<string, number>;
}

export interface IAdminStatsUseCase {
  getDashboardStats(): Promise<{
    users: IUserStats;
    organizations: IOrgStats;
  }>;
  getReports(): Promise<{
    overview: {
      totalUsers: number;
      totalOrganizations: number;
    };
    users: IUserStats;
    organizations: IOrgStats;
  }>;
}
