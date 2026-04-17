import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { IUserManagementUseCase } from "../interface/useCases/IUserManagementUseCase";
import { User } from "../../domain/entities/User";
import {
  EntityNotFoundError,
  ForbiddenError,
} from "../../domain/errors/CommonErrors";
import { ISecurityService } from "../../application/interface/services/ISecurityService";
import { UserRole } from "../../domain/enums/UserRole";

@injectable()
export class UserManagementUseCase implements IUserManagementUseCase {
  constructor(
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.ISecurityService)
    private readonly _securityService: ISecurityService,
  ) {}

  async updateUser(
    userId: string,
    data: Partial<User>,
    requesterId: string,
  ): Promise<User> {
    await this._securityService.validateSuperAdmin(requesterId);
    return this._userRepo.updateProfile(userId, data);
  }

  async updateUserStatus(
    userId: string,
    status: string,
    requesterId: string,
  ): Promise<User> {
    const user = await this._userRepo.findById(userId);
    if (!user) throw new EntityNotFoundError("User", userId);

    const requester = await this._userRepo.findById(requesterId);
    if (!requester) throw new ForbiddenError("Requester not found");

    // RBAC: Super Admin OR (Org Manager of the same Org)
    if (requester.role !== UserRole.SUPER_ADMIN) {
      if (requester.role !== UserRole.ORG_MANAGER)
        throw new ForbiddenError("Access denied");
      if (user.orgId !== requester.orgId)
        throw new ForbiddenError("Member not in your organization");
      if (userId === requesterId)
        throw new ForbiddenError("Cannot change your own status");
    }

    return this._userRepo.updateStatus(userId, status);
  }

  async deleteUser(userId: string, requesterId: string): Promise<void> {
    const user = await this._userRepo.findById(userId);
    if (!user) throw new EntityNotFoundError("User", userId);

    const requester = await this._userRepo.findById(requesterId);
    if (!requester) throw new ForbiddenError("Requester not found");

    // RBAC: Super Admin OR (Org Manager of the same Org)
    if (requester.role !== UserRole.SUPER_ADMIN) {
      if (requester.role !== UserRole.ORG_MANAGER)
        throw new ForbiddenError("Access denied");
      if (user.orgId !== requester.orgId)
        throw new ForbiddenError("Member not in your organization");
      if (userId === requesterId)
        throw new ForbiddenError("Cannot remove yourself");
    }

    await this._userRepo.delete(userId);
  }
}
