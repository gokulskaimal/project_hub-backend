import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IInviteRepo } from "../../application/interface/repositories/IInviteRepo";
import { IInvitationQueryUseCase } from "../interface/useCases/IInvitationQueryUseCase";
import { Invite } from "../../domain/entities/Invite";
import { ISecurityService } from "../../application/interface/services/ISecurityService";
import {
  EntityNotFoundError,
  ForbiddenError,
} from "../../domain/errors/CommonErrors";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { UserRole } from "../../domain/enums/UserRole";

@injectable()
export class InvitationQueryUseCase implements IInvitationQueryUseCase {
  constructor(
    @inject(TYPES.IInviteRepo) private readonly _inviteRepo: IInviteRepo,
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.ISecurityService)
    private readonly _securityService: ISecurityService,
  ) {}

  async listInvitations(
    limit: number,
    offset: number,
    requesterId: string,
    search?: string,
    filters?: {
      orgId?: string;
      status?: string;
    },
  ): Promise<{ invites: Invite[]; total: number }> {
    const requester = await this._userRepo.findById(requesterId);
    if (!requester) throw new ForbiddenError("Requester not found");

    const activeFilters = { ...filters };

    // RBAC: Non-super-admins can only see invites for their own org
    if (requester.role !== UserRole.SUPER_ADMIN) {
      if (!requester.orgId)
        throw new ForbiddenError("Not associated with an organization");
      activeFilters.orgId = requester.orgId;
    }

    return this._inviteRepo.findPaginated(
      limit,
      offset,
      search || "",
      activeFilters,
    );
  }

  async cancelInvitation(
    invitationId: string,
    requesterId: string,
  ): Promise<void> {
    const invitation = await this._inviteRepo.findById(invitationId);
    if (!invitation) throw new EntityNotFoundError("Invitation", invitationId);

    const requester = await this._userRepo.findById(requesterId);
    if (!requester) throw new ForbiddenError("Requester not found");

    // RBAC: Super Admin OR Org Manager of the same org
    if (requester.role !== UserRole.SUPER_ADMIN) {
      if (requester.role !== UserRole.ORG_MANAGER)
        throw new ForbiddenError("Access denied");
      if (invitation.orgId !== requester.orgId)
        throw new ForbiddenError("Invitation is for a different organization");
    }

    await this._inviteRepo.deleteById(invitationId);
  }
}
