import {
  OrganizationStatus,
  Organization,
} from "../../../domain/entities/Organization";

export interface IOrganizationManagementUseCase {
  updateOrganizationStatus(
    orgId: string,
    newStatus: OrganizationStatus,
    requesterId: string,
  ): Promise<Organization>;

  deleteOrganizationCascade(orgId: string, requesterId: string): Promise<void>;

  createOrganization(
    data: Partial<Organization>,
    requesterId: string,
  ): Promise<Organization>;

  updateOrganization(
    orgId: string,
    data: Partial<Organization>,
    requesterId: string,
  ): Promise<Organization>;
}
