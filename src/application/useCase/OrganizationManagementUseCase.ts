import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IUserRepo } from "../../domain/interfaces/IUserRepo";
import { IOrgRepo } from "../../domain/interfaces/IOrgRepo";
import { ILogger } from "../../domain/interfaces/services/ILogger";
import { OrganizationStatus } from "../../domain/entities/Organization";
import { IOrganizationManagementUseCase } from "../../domain/interfaces/useCases/IOrganizationManagementUseCase";
import { HttpError } from "../../utils/asyncHandler";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";

@injectable()
export class OrganizationManagementUseCase
  implements IOrganizationManagementUseCase
{
  constructor(
    @inject(TYPES.IUserRepo) private userRepo: IUserRepo,
    @inject(TYPES.IOrgRepo) private orgRepo: IOrgRepo,
    @inject(TYPES.ILogger) private logger: ILogger,
  ) {}

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
      this.logger.info("Updating organization status with cascading effects", {
        orgId,
        newStatus,
      });

      // Update the organization
      const updatedOrg = await this.orgRepo.update(orgId, {
        status: newStatus,
      });

      if (!updatedOrg) {
        throw new HttpError(StatusCodes.NOT_FOUND, "Organization not found");
      }

      // Get all users in this organization
      const usersInOrg = await this.userRepo.findByOrg(orgId);

      if (usersInOrg && usersInOrg.length > 0) {
        // Update all users based on organization status
        if (newStatus === OrganizationStatus.SUSPENDED) {
          // Suspend all users in the organization
          for (const user of usersInOrg) {
            await this.userRepo.updateStatus(user.id, "SUSPENDED");
            this.logger.info("User suspended due to organization suspension", {
              userId: user.id,
              orgId,
              email: user.email,
            });
          }
        } else if (newStatus === OrganizationStatus.ACTIVE) {
          for (const user of usersInOrg) {
            if (user.status === "SUSPENDED") {
              await this.userRepo.updateStatus(user.id, "ACTIVE");
              this.logger.info(
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

      this.logger.info("Organization status updated successfully", {
        orgId,
        newStatus,
        affectedUsers: usersInOrg?.length || 0,
      });

      return updatedOrg as unknown as Record<string, unknown>;
    } catch (error) {
      this.logger.error(
        "Failed to update organization status",
        error as Error,
        { orgId, newStatus },
      );
      throw error;
    }
  }

  /**
   * Delete organization with cascading deletion of all users
   *
   * @param orgId - Organization ID to delete
   */
  async deleteOrganizationCascade(orgId: string): Promise<void> {
    try {
      this.logger.info("Deleting organization with cascading deletion", {
        orgId,
      });

      // Get all users in this organization
      const usersInOrg = await this.userRepo.findByOrg(orgId);

      if (usersInOrg && usersInOrg.length > 0) {
        // Delete all users in the organization
        for (const user of usersInOrg) {
          await this.userRepo.delete(user.id);
          this.logger.info("User deleted due to organization deletion", {
            userId: user.id,
            orgId,
            email: user.email,
          });
        }
      }

      // Delete the organization
      await this.orgRepo.delete(orgId);

      this.logger.info("Organization deleted successfully with all users", {
        orgId,
        deletedUsers: usersInOrg?.length || 0,
      });
    } catch (error) {
      this.logger.error(
        "Failed to delete organization cascade",
        error as Error,
        { orgId },
      );
      throw error;
    }
  }
}
