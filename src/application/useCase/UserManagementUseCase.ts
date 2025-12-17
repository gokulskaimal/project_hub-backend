import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { IUserManagementUseCase } from "../interface/useCases/IUserManagementUseCase";
import { User } from "../../domain/entities/User";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";

@injectable()
export class UserManagementUseCase implements IUserManagementUseCase {
  constructor(@inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo) {}

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    // Ensure sensitive fields are not updated blindly
    // Typically the repo handles checking, but here we can add business rules
    return this._userRepo.updateProfile(userId, data);
  }

  async updateUserStatus(userId: string, status: string): Promise<User> {
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new EntityNotFoundError("User", userId);
    }
    return this._userRepo.updateStatus(userId, status);
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new EntityNotFoundError("User", userId);
    }
    await this._userRepo.delete(userId);
  }
}

