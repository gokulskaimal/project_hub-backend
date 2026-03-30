import { injectable, inject } from "inversify";
import { IPasswordResetService } from "../../application/interface/services/IPasswordResetService";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { TYPES } from "../container/types";
import { User } from "../../domain/entities/User";

@injectable()
export class PasswordResetService implements IPasswordResetService {
  constructor(@inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo) {}

  async setResetToken(
    email: string,
    token: string,
    expiry: Date,
  ): Promise<void> {
    await this._userRepo.updateResetToken(email, token, expiry);
  }

  async findByToken(token: string): Promise<User | null> {
    return await this._userRepo.findByResetToken(token);
  }

  async clearResetToken(id: string): Promise<void> {
    const user = await this._userRepo.findById(id);
    if (user && user.email) {
      await this._userRepo.updateResetToken(user.email, undefined, undefined);
    }
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    const user = await this._userRepo.findById(id);
    if (user && user.email) {
      await this._userRepo.updatePassword(user.email, passwordHash);
    }
  }
}
