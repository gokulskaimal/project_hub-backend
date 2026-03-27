import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { IUserManagementUseCase } from "../interface/useCases/IUserManagementUseCase";
import { User } from "../../domain/entities/User";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";
import { ISecurityService } from "../../infrastructure/interface/services/ISecurityService";

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
    // Ensure sensitive fields are not updated blindly
    // Typically the repo handles checking, but here we can add business rules
    return this._userRepo.updateProfile(userId, data);
  }

  async updateUserStatus(
    userId: string,
    status: string,
    requesterId: string,
  ): Promise<User> {
    await this._securityService.validateSuperAdmin(requesterId);
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new EntityNotFoundError("User", userId);
    }
    return this._userRepo.updateStatus(userId, status);
  }

  async deleteUser(userId: string, requesterId: string): Promise<void> {
    await this._securityService.validateSuperAdmin(requesterId);
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new EntityNotFoundError("User", userId);
    }
    await this._userRepo.delete(userId);
  }
}
