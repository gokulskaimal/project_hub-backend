export interface IGetOrgAnalyticsUseCase {
  getOrgStats(
    orgId: string,
    requesterId: string,
  ): Promise<{
    members: Record<string, number>;
    invites: Record<string, number>;
    projects: Record<string, number>;
  }>;
  getMemberStats(
    orgId: string,
    requesterId: string,
  ): Promise<Record<string, number>>;
  getInvitationStats(
    orgId: string,
    requesterId: string,
  ): Promise<Record<string, number>>;
  getEpicProgress(
    projectId: string,
    requesterId: string,
  ): Promise<Record<string, unknown>[]>;
}
