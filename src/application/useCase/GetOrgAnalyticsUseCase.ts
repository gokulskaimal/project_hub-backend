import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import {
  IAnalyticsRepo,
  EpicProgressItem,
} from "../../application/interface/repositories/IAnalyticsRepo";
import { IGetOrgAnalyticsUseCase } from "../interface/useCases/IGetOrgAnalyticsUseCase";
import { ISecurityService } from "../../application/interface/services/ISecurityService";
import { IOrgRepo } from "../../application/interface/repositories/IOrgRepo";
import { ISubscriptionRepo } from "../../application/interface/repositories/ISubscriptionRepo";

@injectable()
export class GetOrgAnalyticsUseCase implements IGetOrgAnalyticsUseCase {
  constructor(
    @inject(TYPES.IAnalyticsRepo)
    private readonly _analyticsRepo: IAnalyticsRepo,
    @inject(TYPES.ISecurityService)
    private readonly _securityService: ISecurityService,
    @inject(TYPES.IOrgRepo)
    private readonly _orgRepo: IOrgRepo,
    @inject(TYPES.ISubscriptionRepo)
    private readonly _subscriptionRepo: ISubscriptionRepo,
  ) {}

  async getOrgStats(
    orgId: string,
    requesterId: string,
  ): Promise<{
    members: Record<string, number>;
    invites: Record<string, number>;
    projects: Record<string, number>;
  }> {
    await this._securityService.validateOrgAccess(requesterId, orgId);

    // Lazy evaluation of subscription expiration
    const org = await this._orgRepo.findById(orgId);
    if (org && org.subscriptionStatus === "ACTIVE" && org.subscriptionEndsAt) {
      if (new Date(org.subscriptionEndsAt) < new Date()) {
        await this._orgRepo.update(orgId, { subscriptionStatus: "EXPIRED" });
        // Also update active subscriptions for this org's manager
        const activeSub =
          await this._subscriptionRepo.findByUserId(requesterId);
        if (activeSub && activeSub.status === "active") {
          await this._subscriptionRepo.update(activeSub.id, {
            status: "expired",
          });
        }
      }
    }

    const [members, invites, projects] = await Promise.all([
      this._analyticsRepo.getOrgMemberStats(orgId),
      this._analyticsRepo.getInvitationStats(orgId),
      this._analyticsRepo.getProjectStats(orgId),
    ]);
    return { members, invites, projects };
  }

  async getMemberStats(
    orgId: string,
    requesterId: string,
  ): Promise<Record<string, number>> {
    await this._securityService.validateOrgAccess(requesterId, orgId);
    return this._analyticsRepo.getOrgMemberStats(orgId);
  }

  async getInvitationStats(
    orgId: string,
    requesterId: string,
  ): Promise<Record<string, number>> {
    await this._securityService.validateOrgAccess(requesterId, orgId);
    return this._analyticsRepo.getInvitationStats(orgId);
  }

  async getEpicProgress(
    projectId: string,
    requesterId: string,
  ): Promise<EpicProgressItem[]> {
    await this._securityService.validateProjectAccess(requesterId, projectId);
    return this._analyticsRepo.getEpicProgressReport(projectId);
  }
}
