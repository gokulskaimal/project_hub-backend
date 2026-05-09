import { injectable, inject } from "inversify";
import { ISecurityService } from "../../application/interface/services/ISecurityService";
import { TYPES } from "../container/types";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { IProjectRepo } from "../../application/interface/repositories/IProjectRepo";
import { IOrgRepo } from "../../application/interface/repositories/IOrgRepo";
import { UserRole } from "../../domain/enums/UserRole";
import {
  ForbiddenError,
  EntityNotFoundError,
} from "../../domain/errors/CommonErrors";

@injectable()
export class SecurityService implements ISecurityService {
  constructor(
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.IOrgRepo) private _orgRepo: IOrgRepo,
  ) {}

  async validateOrgAccess(userId: string, orgId: string): Promise<void> {
    const user = await this._userRepo.findById(userId);
    if (!user) throw new EntityNotFoundError("User", userId);

    if (user.orgId !== orgId && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenError("You do not have access to this organization");
    }
  }

  async validateRole(userId: string, allowedRoles: UserRole[]): Promise<void> {
    const user = await this._userRepo.findById(userId);
    if (!user) throw new EntityNotFoundError("User", userId);

    if (
      !allowedRoles.includes(user.role as UserRole) &&
      user.role !== UserRole.SUPER_ADMIN
    ) {
      throw new ForbiddenError(
        "You do not have the required role for this action",
      );
    }
  }

  async validateProjectAccess(
    userId: string,
    projectId: string,
  ): Promise<void> {
    const user = await this._userRepo.findById(userId);
    if (!user) throw new EntityNotFoundError("User", userId);

    const project = await this._projectRepo.findById(projectId);
    if (!project) throw new EntityNotFoundError("Project", projectId);

    if (user.orgId !== project.orgId && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenError("You do not have access to this project");
    }
  }

  async validateOrgManager(userId: string, orgId: string): Promise<void> {
    const user = await this._userRepo.findById(userId);
    if (!user) throw new EntityNotFoundError("User", userId);

    if (user.role === UserRole.SUPER_ADMIN) return;

    if (user.orgId !== orgId || user.role !== UserRole.ORG_MANAGER) {
      throw new ForbiddenError(
        "Only organization managers can perform this action",
      );
    }
  }

  async validateSuperAdmin(userId: string): Promise<void> {
    const user = await this._userRepo.findById(userId);
    if (!user) throw new EntityNotFoundError("User", userId);

    if (user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenError("Only super admins can perform this action");
    }
  }

  async validateUserOwnership(
    requesterId: string,
    targetUserId: string,
  ): Promise<void> {
    if (requesterId === targetUserId) return; // Self access is always allowed

    const user = await this._userRepo.findById(requesterId);
    if (!user) throw new EntityNotFoundError("User", requesterId);

    if (user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenError(
        "You are not authorized to access this user's data",
      );
    }
  }

  async validateUserBelongsToOrg(userId: string, orgId: string): Promise<void> {
    const user = await this._userRepo.findById(userId);
    if (!user || user.orgId !== orgId) {
      throw new ForbiddenError(
        `User ${userId} does not belong to this organization`,
      );
    }
  }

  async validateMembersBelongToOrg(
    memberIds: string[],
    orgId: string,
  ): Promise<void> {
    const members = await this._userRepo.findByIds(memberIds);
    for (const member of members) {
      if (member.orgId !== orgId) {
        throw new ForbiddenError(
          `User ${member.id} does not belong to this organization`,
        );
      }
    }
  }

  async validatePlan(orgId: string): Promise<void> {
    const org = await this._orgRepo.findById(orgId);
    if (!org) throw new EntityNotFoundError("Organization", orgId);

    // 1. Mandatory Plan Check
    if (!org.planId) {
      throw new ForbiddenError(
        "You must select a plan to continue. Please visit the billing section to choose a suitable plan.",
      );
    }

    // 2. Expiry Check
    const now = new Date();
    const isExpired =
      org.subscriptionStatus === "EXPIRED" ||
      (org.subscriptionEndsAt && new Date(org.subscriptionEndsAt) < now);

    if (isExpired) {
      throw new ForbiddenError(
        "Your current plan has expired. Please renew your subscription to continue enjoying benefits.",
      );
    }
  }
}
