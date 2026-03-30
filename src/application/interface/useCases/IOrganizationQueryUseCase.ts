import { Organization } from "../../../domain/entities/Organization";

export interface IOrganizationQueryUseCase {
  listOrganizations(
    limit: number,
    offset: number,
    search?: string,
  ): Promise<{ organizations: Organization[]; total: number }>;

  getOrganizationById(orgId: string): Promise<Organization | null>;
}
