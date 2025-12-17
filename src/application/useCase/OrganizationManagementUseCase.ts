import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { IOrgRepo } from "../../infrastructure/interface/repositories/IOrgRepo";
import { IInviteRepo } from "../../infrastructure/interface/repositories/IInviteRepo";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { OrganizationStatus, Organization } from "../../domain/entities/Organization";
import { IOrganizationManagementUseCase } from "../interface/useCases/IOrganizationManagementUseCase";
import { OrganizationNotFoundError } from "../../domain/errors/AuthErrors";

@injectable()
export class OrganizationManagementUseCase
  implements IOrganizationManagementUseCase
{
  constructor(
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.IOrgRepo) private readonly _orgRepo: IOrgRepo,
    @inject(TYPES.IInviteRepo) private readonly _inviteRepo: IInviteRepo,
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
  ) {}

  /**
   * Delete organization with cascading deletion of all users
   *
   * @param orgId - Organization ID to delete
   */
  async deleteOrganizationCascade(orgId: string): Promise<void> {
    try {
      this._logger.info("Deleting organization with cascading deletion", {
        orgId,
      });

      // Get all users in this organization
      const usersInOrg = await this._userRepo.findByOrg(orgId);

      if (usersInOrg && usersInOrg.length > 0) {
        // Delete all users in the organization
        for (const user of usersInOrg) {
          await this._userRepo.delete(user.id);
          this._logger.info("User deleted due to organization deletion", {
            userId: user.id,
            orgId,
            email: user.email,
          });
        }
      }

      // Delete all invitations for this organization
      const deletedInvites = await this._inviteRepo.deleteByOrganization(orgId);
      this._logger.info("Deleted invitations for organization", {
        orgId,
        count: deletedInvites,
      });

      // Delete the organization
      await this._orgRepo.hardDelete(orgId);

      this._logger.info(
        "Organization deleted successfully with all users and invites",
        {
          orgId,
          deletedUsers: usersInOrg?.length || 0,
          deletedInvites,
        },
      );
    } catch (error) {
      this._logger.error(
        "Failed to delete organization cascade",
        error as Error,
        { orgId },
      );
      throw error;
    }
  }

  /**
   * Update organization status with cascading effects to users
   *
   * @param orgId - Organization ID to update
   * @param newStatus - New status (ACTIVE, BLOCKED, INACTIVE)
   * @returns Updated organization
   */
  async updateOrganizationStatus(
    orgId: string,
    newStatus: OrganizationStatus,
  ): Promise<Record<string, unknown>> {
    try {
      this._logger.info("Updating organization status with cascading effects", {
        orgId,
        newStatus,
      });

      // Update the organization
      const updatedOrg = await this._orgRepo.update(orgId, {
        status: newStatus,
      });

      if (!updatedOrg) {
        throw new OrganizationNotFoundError();
      }

      // Get all users in this organization
      const usersInOrg = await this._userRepo.findByOrg(orgId);

      if (usersInOrg && usersInOrg.length > 0) {
        // Update all users based on organization status
        if (newStatus === OrganizationStatus.SUSPENDED) {
          // Suspend all users in the organization
          for (const user of usersInOrg) {
            await this._userRepo.updateStatus(user.id, "SUSPENDED");
            this._logger.info("User suspended due to organization suspension", {
              userId: user.id,
              orgId,
              email: user.email,
            });
          }
        } else if (newStatus === OrganizationStatus.ACTIVE) {
          for (const user of usersInOrg) {
            if (user.status === "SUSPENDED") {
              await this._userRepo.updateStatus(user.id, "ACTIVE");
              this._logger.info(
                "User reactivated due to organization activation",
                {
                  userId: user.id,
                  orgId,
                  email: user.email,
                },
              );
            }
          }
        }
      }

      this._logger.info("Organization status updated successfully", {
        orgId,
        newStatus,
        affectedUsers: usersInOrg?.length || 0,
      });

      return updatedOrg as unknown as Record<string, unknown>;
    } catch (error) {
      this._logger.error(
        "Failed to update organization status",
        error as Error,
        { orgId, newStatus },
      );
      throw error;
    }
  }

  async createOrganization(data: Partial<Organization>): Promise<Organization> {
    return this._orgRepo.create(data);
  }

  async updateOrganization(orgId: string, data: Partial<Organization>): Promise<Organization> {
    const updatedOrg = await this._orgRepo.update(orgId, data);
    if (!updatedOrg) {
        throw new OrganizationNotFoundError();
    }
    return updatedOrg;
  }
}

