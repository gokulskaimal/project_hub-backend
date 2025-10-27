/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IUserRepo } from "../../domain/interfaces/IUserRepo";
import { IOrgRepo } from "../../domain/interfaces/IOrgRepo";
import { IInviteMemberUseCase } from "../../domain/interfaces/useCases/IInviteMemberUseCase";
import { ILogger } from "../../domain/interfaces/services/ILogger";
import { OrganizationStatus } from "../../domain/entities/Organization";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../../infrastructure/config/common.constants";

/**
 * Admin Controller
 *
 * Handles administrative operations for managing organizations and users
 * Implements the presentation layer of the application architecture
 */
@injectable()
export class AdminController {
  /**
   * Creates a new AdminController instance with dependency injection
   *
   * @param userRepo - User repository for user management
   * @param orgRepo - Organization repository for organization management
   * @param inviteMemberUseCase - Use case for inviting members
   * @param logger - Logging service
   */
  constructor(
    @inject(TYPES.IUserRepo) private userRepo: IUserRepo,
    @inject(TYPES.IOrgRepo) private orgRepo: IOrgRepo,
    @inject(TYPES.IInviteMemberUseCase)
    private inviteMemberUseCase: IInviteMemberUseCase,
    @inject(TYPES.ILogger) private logger: ILogger,
  ) {}

  /**
   * Lists all organizations with pagination and search capabilities
   *
   * @param req - Express request object with query parameters
   * @param res - Express response object
   */
  async listOrganizations(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 50, offset = 0, search } = req.query;

      const result = await this.orgRepo.findPaginated(
        Number(limit),
        Number(offset),
        search as string,
      );

      res.status(StatusCodes.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      this.logger.error("List organizations failed", error as Error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch organizations",
      });
    }
  }

  /**
   * Creates a new organization
   *
   * @param req - Express request object with organization data
   * @param res - Express response object
   */
  async createOrganization(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, settings } = req.body;

      if (!name) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Organization name is required",
        });
        return;
      }

      const newOrg = await this.orgRepo.create({
        name,
        description,
        settings,
        status: OrganizationStatus.ACTIVE,
        createdAt: new Date(),
      });

      res.status(StatusCodes.CREATED).json({
        success: true,
        message: COMMON_MESSAGES.CREATED,
        data: newOrg,
      });
    } catch (error) {
      this.logger.error("Create organization failed", error as Error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to create organization",
      });
    }
  }

  /**
   * Retrieves an organization by its ID
   *
   * @param req - Express request object with organization ID parameter
   * @param res - Express response object
   */
  async getOrganizationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const organization = await this.orgRepo.findById(id);
      if (!organization) {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: COMMON_MESSAGES.NOT_FOUND,
        });
        return;
      }

      res.status(StatusCodes.OK).json({
        success: true,
        data: organization,
      });
    } catch (error) {
      this.logger.error("Get organization by ID failed", error as Error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: COMMON_MESSAGES.SERVER_ERROR,
      });
    }
  }

  /**
   * Updates an existing organization
   *
   * @param req - Express request object with organization ID and update data
   * @param res - Express response object
   */
  async updateOrganization(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedOrg = await this.orgRepo.update(id, updateData);

      res.status(StatusCodes.OK).json({
        success: true,
        message: COMMON_MESSAGES.UPDATED,
        data: updatedOrg,
      });
    } catch (error) {
      this.logger.error("Update organization failed", error as Error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to update organization",
      });
    }
  }

  /**
   * Deletes an organization by its ID
   *
   * @param req - Express request object with organization ID parameter
   * @param res - Express response object
   */
  async deleteOrganization(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await this.orgRepo.delete(id);

      res.status(StatusCodes.OK).json({
        success: true,
        message: COMMON_MESSAGES.DELETED,
      });
    } catch (error) {
      this.logger.error("Delete organization failed", error as Error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: COMMON_MESSAGES.SERVER_ERROR,
      });
    }
  }

  /**
   * Lists all users with pagination, search, and filtering capabilities
   *
   * @param req - Express request object with query parameters
   * @param res - Express response object
   */
  async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 50, offset = 0, search, orgId, role, status } = req.query;

      const filters = {
        orgId: orgId as string,
        role: role as string,
        status: status as string,
      };

      const result = await this.userRepo.findPaginated(
        Number(limit),
        Number(offset),
        search as string,
        filters,
      );

      res.status(StatusCodes.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      this.logger.error("List users failed", error as Error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: COMMON_MESSAGES.SERVER_ERROR,
      });
    }
  }

  /**
   * Retrieves a user by their ID
   *
   * @param req - Express request object with user ID parameter
   * @param res - Express response object
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await this.userRepo.findById(id);
      if (!user) {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: COMMON_MESSAGES.NOT_FOUND,
        });
        return;
      }

      const {
        password,
        otp,
        otpExpiry,
        resetPasswordToken,
        resetPasswordExpires,
        ...safeUser
      } = user;

      res.status(StatusCodes.OK).json({
        success: true,
        data: safeUser,
      });
    } catch (error) {
      this.logger.error("Get user by ID failed", error as Error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: COMMON_MESSAGES.SERVER_ERROR,
      });
    }
  }

  /**
   * Updates a user's information
   *
   * @param req - Express request object with user ID and update data
   * @param res - Express response object
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Remove sensitive fields that shouldn't be updated directly
      const {
        password,
        otp,
        otpExpiry,
        resetPasswordToken,
        resetPasswordExpires,
        ...safeUpdateData
      } = updateData;

      const updatedUser = await this.userRepo.updateProfile(id, safeUpdateData);

      const {
        password: _,
        otp: __,
        otpExpiry: ___,
        resetPasswordToken: ____,
        resetPasswordExpires: _____,
        ...safeUser
      } = updatedUser;

      res.status(StatusCodes.OK).json({
        success: true,
        message: COMMON_MESSAGES.UPDATED,
        data: safeUser,
      });
    } catch (error) {
      this.logger.error("Update user failed", error as Error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: COMMON_MESSAGES.SERVER_ERROR,
      });
    }
  }

  /**
   * Updates a user's status
   *
   * @param req - Express request object with user ID and status data
   * @param res - Express response object
   */
  async updateUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: COMMON_MESSAGES.INVALID_INPUT,
        });
        return;
      }

      const updatedUser = await this.userRepo.updateStatus(id, status);

      const {
        password,
        otp,
        otpExpiry,
        resetPasswordToken,
        resetPasswordExpires,
        ...safeUser
      } = updatedUser;

      res.status(StatusCodes.OK).json({
        success: true,
        message: COMMON_MESSAGES.UPDATED,
        data: safeUser,
      });
    } catch (error) {
      this.logger.error("Update user status failed", error as Error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: COMMON_MESSAGES.SERVER_ERROR,
      });
    }
  }

  /**
   * Deletes a user from the system
   *
   * @param req - Express request object with user ID parameter
   * @param res - Express response object
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await this.userRepo.delete(id);

      res.status(StatusCodes.OK).json({
        success: true,
        message: COMMON_MESSAGES.DELETED,
      });
    } catch (error) {
      this.logger.error("Delete user failed", error as Error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to delete user",
      });
    }
  }

  /**
   * Generates system reports with user and organization statistics
   *
   * @param req - Express request object
   * @param res - Express response object
   */
  async getReports(req: Request, res: Response): Promise<void> {
    try {
      const userStats = await this.userRepo.getStats();
      const orgStats = await this.orgRepo.getStats();

      const report = {
        overview: {
          totalUsers: userStats.total || 0,
          totalOrganizations: orgStats.total || 0,
          generatedAt: new Date().toISOString(),
        },
        users: userStats,
        organizations: orgStats,
      };

      res.status(StatusCodes.OK).json({
        success: true,
        message: COMMON_MESSAGES,
        data: report,
      });
    } catch (error) {
      this.logger.error("Get reports failed", error as Error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: COMMON_MESSAGES.SERVER_ERROR,
      });
    }
  }

  /**
   * Retrieves statistics for the admin dashboard
   *
   * @param req - Express request object
   * @param res - Express response object
   */
  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const userStats = await this.userRepo.getStats();
      const orgStats = await this.orgRepo.getStats();

      res.status(StatusCodes.OK).json({
        success: true,
        data: {
          users: userStats,
          organizations: orgStats,
        },
      });
    } catch (error) {
      this.logger.error("Get dashboard stats failed", error as Error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch dashboard statistics",
      });
    }
  }

  /**
   * Retrieves all users belonging to a specific organization
   *
   * @param req - Express request object with organization ID parameter
   * @param res - Express response object
   */
  async getUsersByOrganization(req: Request, res: Response): Promise<void> {
    try {
      const { orgId } = req.params;

      const users = await this.userRepo.findByOrg(orgId);

      res.status(StatusCodes.OK).json({
        success: true,
        data: users,
      });
    } catch (error) {
      this.logger.error("Get users by organization failed", error as Error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: COMMON_MESSAGES.SERVER_ERROR,
      });
    }
  }

  /**
   * Invites a new member to an organization
   *
   * @param req - Express request object with email, organization ID, and role
   * @param res - Express response object
   */
  async inviteMember(req: Request, res: Response): Promise<void> {
    try {
      const { email, orgId, role } = req.body;

      if (!email || !orgId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: COMMON_MESSAGES.INVALID_INPUT,
        });
        return;
      }

      const result = await this.inviteMemberUseCase.execute(email, orgId, role);

      res.status(StatusCodes.CREATED).json({
        success: true,
        message: COMMON_MESSAGES.INVITATION_SENT,
        data: result,
      });
    } catch (error) {
      this.logger.error("Invite member failed", error as Error);
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  /**
   * Invites multiple members to an organization in bulk
   *
   * @param req - Express request object with emails array, organization ID, and role
   * @param res - Express response object
   */
  async bulkInviteMembers(req: Request, res: Response): Promise<void> {
    try {
      const { emails, orgId, role } = req.body;

      if (!emails || !Array.isArray(emails) || !orgId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: COMMON_MESSAGES.INVALID_INPUT,
        });
        return;
      }

      const result = await this.inviteMemberUseCase.bulkInvite(
        emails,
        orgId,
        role,
      );

      res.status(StatusCodes.OK).json({
        success: true,
        message: COMMON_MESSAGES.INVITATION_SENT,
        data: result,
      });
    } catch (error) {
      this.logger.error("Bulk invite members failed", error as Error);
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }
}
