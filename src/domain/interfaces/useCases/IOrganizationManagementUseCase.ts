/* eslint-disable @typescript-eslint/no-explicit-any */
import { OrganizationStatus } from "../../entities/Organization";

export interface IOrganizationManagementUseCase {
  updateOrganizationStatus(
    orgId: string,
    newStatus: OrganizationStatus,
  ): Promise<any>;

  deleteOrganizationCascade(orgId: string): Promise<void>;
}
