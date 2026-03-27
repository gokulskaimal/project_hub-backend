export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  verified: number;
  unverified: number;
  byRole: Record<string, number>;
}

export interface OrgStats {
  total: number;
  active: number;
  inactive: number;
  byStatus: Record<string, number>;
}

export interface IAnalyticsService {
  getUserStats(): Promise<UserStats>;
  getOrgStats(): Promise<OrgStats>;
}
