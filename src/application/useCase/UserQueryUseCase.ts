import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { IUserQueryUseCase } from "../interface/useCases/IUserQueryUseCase";
import { User } from "../../domain/entities/User";

@injectable()
export class UserQueryUseCase implements IUserQueryUseCase {
  constructor(@inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo) {}

  async listUsers(
    limit: number,
    offset: number,
    search?: string,
    filters?: {
      orgId?: string;
      role?: string;
      status?: string;
    },
  ): Promise<{ users: User[]; total: number }> {
    return this._userRepo.findPaginated(limit, offset, search || "", filters);
  }

  async getUserById(userId: string): Promise<User | null> {
    return this._userRepo.findById(userId);
  }

  async getUsersByOrganization(orgId: string): Promise<User[]> {
    const users = await this._userRepo.findByOrg(orgId);
    return users || [];
  }
}
