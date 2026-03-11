import {
  OrganizationStatus,
  Organization,
} from "../../../domain/entities/Organization";

export interface IOrganizationManagementUseCase {
  updateOrganizationStatus(
    orgId: string,
    newStatus: OrganizationStatus,
  ): Promise<Organization>;

  deleteOrganizationCascade(orgId: string): Promise<void>;

  createOrganization(data: Partial<Organization>): Promise<Organization>;

  updateOrganization(
    orgId: string,
    data: Partial<Organization>,
  ): Promise<Organization>;
}
