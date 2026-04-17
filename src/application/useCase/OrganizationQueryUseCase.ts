import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IOrgRepo } from "../../application/interface/repositories/IOrgRepo";
import { IOrganizationQueryUseCase } from "../interface/useCases/IOrganizationQueryUseCase";
import { IAnalyticsRepo } from "../../application/interface/repositories/IAnalyticsRepo";
import { Organization } from "../../domain/entities/Organization";
import { ISecurityService } from "../interface/services/ISecurityService";

@injectable()
export class OrganizationQueryUseCase implements IOrganizationQueryUseCase {
  constructor(
    @inject(TYPES.IOrgRepo) private readonly _orgRepo: IOrgRepo,
    @inject(TYPES.IAnalyticsRepo)
    private readonly _analyticsRepo: IAnalyticsRepo,
    @inject(TYPES.ISecurityService)
    private readonly _securityService: ISecurityService,
  ) {}

  async listOrganizations(
    limit: number,
    offset: number,
    search?: string,
    status?: string,
  ): Promise<{ organizations: Organization[]; total: number }> {
    const result = await this._orgRepo.findPaginated(
      limit,
      offset,
      search || "",
      status,
    );

    if (result.organizations.length > 0) {
      const orgIds = result.organizations.map((o: Organization) => o.id!);
      const countMap = await this._analyticsRepo.getUserCountsByOrgIds(orgIds);

      result.organizations = result.organizations.map((org: Organization) => ({
        ...org,
        currentUserCount: countMap.get(org.id!) || 0,
      }));
    }

    return result;
  }

  async getOrganizationById(
    orgId: string,
    requesterId: string,
  ): Promise<Organization | null> {
    await this._securityService.validateOrgAccess(requesterId, orgId);
    return this._orgRepo.findById(orgId);
  }
}
