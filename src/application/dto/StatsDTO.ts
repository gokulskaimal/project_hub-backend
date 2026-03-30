export interface OrgStatsDTO {
  total: number;
  active: number;
  inactive: number;
  byStatus: Record<string, number>;
}

export interface UserStatsDTO {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  verified: number;
  unverified: number;
  byRole: Record<string, number>;
}

export interface AdminDashboardStatsDTO {
  users: UserStatsDTO;
  organizations: OrgStatsDTO;
}

export interface AdminReportDTO {
  overview: {
    totalUsers: number;
    totalOrganizations: number;
  };
  users: UserStatsDTO;
  organizations: OrgStatsDTO;
}
