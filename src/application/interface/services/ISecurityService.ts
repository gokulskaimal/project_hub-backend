import { UserRole } from "../../../domain/enums/UserRole";

export interface ISecurityService {
  /**
   * Verify that a user belongs to a specific organization.
   * Throws ForbiddenError if not.
   */
  validateOrgAccess(userId: string, orgId: string): Promise<void>;

  /**
   * Verify that a user has one of the required roles.
   * Throws ForbiddenError if not.
   */
  validateRole(userId: string, allowedRoles: UserRole[]): Promise<void>;

  /**
   * Verify that a user has access to a specific project (via organization membership).
   * Throws ForbiddenError if not.
   */
  validateProjectAccess(userId: string, projectId: string): Promise<void>;

  /**
   * Verify that a user is an ORG_MANAGER of the organization.
   * Throws ForbiddenError if not.
   */
  validateOrgManager(userId: string, orgId: string): Promise<void>;

  /**
   * Verify that a user is a SUPER_ADMIN.
   * Throws ForbiddenError if not.
   */
  validateSuperAdmin(userId: string): Promise<void>;

  /**
   * Verify that a user is modifying their own data (or is a SUPER_ADMIN).
   * Throws ForbiddenError if not.
   */
  validateUserOwnership(
    requesterId: string,
    targetUserId: string,
  ): Promise<void>;

  /**
   * Verify that a user (e.g. assignee) belongs to the organization.
   * Throws ValidationError if not.
   */
  validateUserBelongsToOrg(userId: string, orgId: string): Promise<void>;

  /**
   * Verify that all users (e.g. team members) belong to the organization.
   * Throws ValidationError if not.
   */
  validateMembersBelongToOrg(memberIds: string[], orgId: string): Promise<void>;
}
