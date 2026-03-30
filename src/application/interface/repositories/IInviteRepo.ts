import { Invite } from "../../../domain/entities/Invite";

/**
 * Invite Repository Interface - Enhanced Version
 * Supports all invitation operations needed by Use Cases
 */
export interface IInviteRepo {
  /**
   * Create new invitation
   * @param invite - Partial invitation data
   * @returns Created invitation
   */
  create(invite: Partial<Invite>): Promise<Invite>;

  /**
   * Find invitation by token
   * @param token - Invitation token
   * @returns Invitation or null if not found
   */
  findByToken(token: string): Promise<Invite | null>;

  /**
   * Find pending invitation by email and organization
   * @param email - Invitee email
   * @param orgId - Organization ID
   * @returns Pending invitation or null
   */
  findPendingByEmail(email: string, orgId: string): Promise<Invite | null>;

  /**
   * Find all invitations for an organization
   * @param orgId - Organization ID
   * @returns Array of invitations
   */
  findByOrganization(orgId: string): Promise<Invite[]>;

  /**
   * Find all pending invitations for an organization
   * @param orgId - Organization ID
   * @returns Array of pending invitations
   */
  findPendingByOrganization(orgId: string): Promise<Invite[]>;

  /**
   * Mark invitation as accepted
   * @param token - Invitation token
   */
  markAccepted(token: string): Promise<void>;

  /**
   * Mark invitation as cancelled
   * @param token - Invitation token
   */
  markCancelled(token: string): Promise<void>;

  /**
   * Mark invitation as expired
   * @param token - Invitation token
   */
  expire(token: string): Promise<void>;

  /**
   * Expire all invitations that have passed their expiry date
   * @returns Number of expired invitations
   */
  expireOldInvitations(): Promise<number>;

  /**
   * Delete invitation by token
   * @param token - Invitation token
   */
  delete(token: string): Promise<boolean>;

  /**
   * Update invitation
   * @param token - Invitation token
   * @param updateData - Data to update
   * @returns Updated invitation
   */
  update(token: string, updateData: Partial<Invite>): Promise<Invite | null>;

  /**
   * Check if invitation exists and is valid
   * @param token - Invitation token
   * @returns Whether invitation is valid
   */
  isValidInvitation(token: string): Promise<boolean>;

  /**
   * Get invitation statistics for organization
   * @param orgId - Organization ID
   * @returns Invitation statistics
   */
  getInvitationStats(orgId: string): Promise<{
    total: number;
    pending: number;
    accepted: number;
    expired: number;
    cancelled: number;
  }>;

  /**
   * Find invitation by ID
   * @param id - Invitation ID
   */
  findById(id: string): Promise<Invite | null>;

  /**
   * Mark invitation as cancelled by ID
   * @param id - Invitation ID
   */
  markCancelledById(id: string): Promise<void>;

  /**
   * Delete invitation by ID
   * @param id - Invitation ID
   */
  deleteById(id: string): Promise<boolean>;

  /**
   * Delete all invitations for an organization
   * @param orgId - Organization ID
   * @returns Number of deleted invitations
   */
  deleteByOrganization(orgId: string): Promise<number>;
}
