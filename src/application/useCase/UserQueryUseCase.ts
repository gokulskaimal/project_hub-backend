import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { IUserQueryUseCase } from "../interface/useCases/IUserQueryUseCase";
import { User } from "../../domain/entities/User";
import { ISecurityService } from "../../application/interface/services/ISecurityService";
import { UserRole } from "../../domain/enums/UserRole";
import { ForbiddenError } from "../../domain/errors/CommonErrors";

@injectable()
export class UserQueryUseCase implements IUserQueryUseCase {
  constructor(
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.ISecurityService)
    private readonly _securityService: ISecurityService,
  ) {}

  async listUsers(
    limit: number,
    offset: number,
    requesterId: string,
    search?: string,
    filters?: {
      orgId?: string;
      role?: string;
      status?: string;
    },
  ): Promise<{ users: User[]; total: number }> {
    const requester = await this._userRepo.findById(requesterId);
    if (!requester) throw new ForbiddenError("Requester not found");

    const activeFilters = { ...filters };

    // Enforce orgId filter for non-super-admins
    if (requester.role !== UserRole.SUPER_ADMIN) {
      if (!requester.orgId)
        throw new ForbiddenError("User not associated with an organization");
      activeFilters.orgId = requester.orgId;
    }

    return this._userRepo.findPaginated(
      limit,
      offset,
      search || "",
      activeFilters,
    );
  }

  async getUserById(userId: string, requesterId: string): Promise<User | null> {
    const user = await this._userRepo.findById(userId);
    if (!user) return null;

    const requester = await this._userRepo.findById(requesterId);
    if (!requester) throw new ForbiddenError("Requester not found");

    // RBAC: Non-super-admins can only see users in their own org
    if (requester.role !== UserRole.SUPER_ADMIN) {
      if (user.role === UserRole.SUPER_ADMIN) return null; // Hide super admins
      if (user.orgId !== requester.orgId) {
        throw new ForbiddenError(
          "Access denied: User belongs to a different organization",
        );
      }
    }

    return user;
  }

  async getUsersByOrganization(
    orgId: string,
    requesterId: string,
  ): Promise<User[]> {
    await this._securityService.validateOrgAccess(requesterId, orgId);
    const users = await this._userRepo.findByOrg(orgId);
    return users || [];
  }
}
