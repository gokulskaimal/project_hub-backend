import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IUserRepo } from "../../domain/interfaces/IUserRepo";
import { IOrgRepo } from "../../domain/interfaces/IOrgRepo";
import { IInviteMemberUseCase } from "../../domain/interfaces/useCases/IInviteMemberUseCase";
import { IOrganizationManagementUseCase } from "../../domain/interfaces/useCases/IOrganizationManagementUseCase";
import { ILogger } from "../../domain/interfaces/services/ILogger";
import { OrganizationStatus } from "../../domain/entities/Organization";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../../infrastructure/config/common.constants";
import { asyncHandler, HttpError } from "../../utils/asyncHandler";

@injectable()
export class AdminController {
  constructor(
    @inject(TYPES.IUserRepo) private userRepo: IUserRepo,
    @inject(TYPES.IOrgRepo) private orgRepo: IOrgRepo,
    @inject(TYPES.IInviteMemberUseCase)
    private inviteMemberUseCase: IInviteMemberUseCase,
    @inject(TYPES.IOrganizationManagementUseCase)
    private orgManagementUseCase: IOrganizationManagementUseCase,
    @inject(TYPES.ILogger) private logger: ILogger,
  ) {}

  private sendSuccess<T>(
    res: Response,
    data: T,
    message: string = "Success",
    status: number = StatusCodes.OK,
  ): void {
    res
      .status(status)
      .json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
      });
  }

  listOrganizations = asyncHandler(async (req: Request, res: Response) => {
    const { limit = 50, offset = 0, search } = req.query;
    this.logger.info("Listing organizations", { limit, offset, search });
    if (limit === undefined || offset === undefined) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "Invalid pagination parameters",
      );
    }
    const result = await this.orgRepo.findPaginated(
      Number(limit),
      Number(offset),
      search as string,
    );
    this.sendSuccess(res, result);
  });

  createOrganization = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, settings } = req.body;
    this.logger.info("Creating organization", { name });
    if (!name)
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "Organization name is required",
      );
    if (!description)
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "Organization description is required",
      );
    if (!settings)
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "Organization settings are required",
      );

    const newOrg = await this.orgRepo.create({
      name,
      description,
      settings,
      status: OrganizationStatus.ACTIVE,
      createdAt: new Date(),
    });
    this.sendSuccess(res, newOrg, COMMON_MESSAGES.CREATED, StatusCodes.CREATED);
  });

  getOrganizationById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.info("Fetching organization by ID", { orgId: id });
    const organization = await this.orgRepo.findById(id);
    if (!organization)
      throw new HttpError(StatusCodes.NOT_FOUND, COMMON_MESSAGES.NOT_FOUND);
    this.sendSuccess(res, organization);
  });

  updateOrganization = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;
    this.logger.info("Updating organization", {
      orgId: id,
      updatedFields: Object.keys(updateData || {}),
    });
    if (!id)
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "Organization ID is required",
      );
    if (!updateData)
      throw new HttpError(StatusCodes.BAD_REQUEST, "Update data is required");

    // If status is being updated, use the use case to handle cascading effects
    if (updateData.status) {
      const updatedOrg =
        await this.orgManagementUseCase.updateOrganizationStatus(
          id,
          updateData.status,
        );

      // If there are other fields to update besides status, update them now
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { status: _status, ...otherFields } = updateData;
      if (Object.keys(otherFields).length > 0) {
        await this.orgRepo.update(id, otherFields);
        // Re-fetch to get the final state
        const finalOrg = await this.orgRepo.findById(id);
        this.sendSuccess(res, finalOrg, COMMON_MESSAGES.UPDATED);
        return;
      }

      this.sendSuccess(res, updatedOrg, COMMON_MESSAGES.UPDATED);
      return;
    }

    // Default update for non-status fields
    const updatedOrg = await this.orgRepo.update(id, updateData);
    this.sendSuccess(res, updatedOrg, COMMON_MESSAGES.UPDATED);
  });

  deleteOrganization = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.info("Deleting organization", { orgId: id });
    if (!id)
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "Organization ID is required",
      );

    await this.orgManagementUseCase.deleteOrganizationCascade(id);
    this.sendSuccess(res, null, COMMON_MESSAGES.DELETED);
  });

  listUsers = asyncHandler(async (req: Request, res: Response) => {
    const { limit = 50, offset = 0, search, orgId, role, status } = req.query;
    this.logger.info("Listing users", {
      limit,
      offset,
      search,
      orgId,
      role,
      status,
    });

    // Explicitly typed filters object
    const filters = {
      orgId: typeof orgId === "string" ? orgId : undefined,
      role: typeof role === "string" ? role : undefined,
      status: typeof status === "string" ? status : undefined,
    };

    const result = await this.userRepo.findPaginated(
      Number(limit),
      Number(offset),
      search as string,
      filters,
    );
    this.sendSuccess(res, result);
  });

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.info("Fetching user by ID", { userId: id });
    if (!id)
      throw new HttpError(StatusCodes.BAD_REQUEST, "User ID is required");

    const user = await this.userRepo.findById(id);
    if (!user)
      throw new HttpError(StatusCodes.NOT_FOUND, COMMON_MESSAGES.NOT_FOUND);

    const safeUser = {
      ...(user as unknown as Record<string, unknown>),
    } as Record<string, unknown>;
    Reflect.deleteProperty(safeUser, "password");
    Reflect.deleteProperty(safeUser, "otp");
    this.sendSuccess(res, safeUser);
  });

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.info("Updating user", { userId: id });
    if (!id)
      throw new HttpError(StatusCodes.BAD_REQUEST, "User ID is required");

    const safeUpdateData = {
      ...(req.body as Record<string, unknown>),
    } as Record<string, unknown>;
    Reflect.deleteProperty(safeUpdateData, "password");
    Reflect.deleteProperty(safeUpdateData, "otp");
    const updatedUser = await this.userRepo.updateProfile(id, safeUpdateData);
    const safeUser = {
      ...(updatedUser as unknown as Record<string, unknown>),
    } as Record<string, unknown>;
    Reflect.deleteProperty(safeUser, "password");
    this.sendSuccess(res, safeUser, COMMON_MESSAGES.UPDATED);
  });

  updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    this.logger.info("Updating user status", { userId: id, status });
    if (!id)
      throw new HttpError(StatusCodes.BAD_REQUEST, "User ID is required");
    if (!status)
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        COMMON_MESSAGES.INVALID_INPUT,
      );

    const updatedUser = await this.userRepo.updateStatus(id, status);
    const safeUser = {
      ...(updatedUser as unknown as Record<string, unknown>),
    } as Record<string, unknown>;
    Reflect.deleteProperty(safeUser, "password");
    this.sendSuccess(res, safeUser, COMMON_MESSAGES.UPDATED);
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.info("Deleting user", { userId: id });
    if (!id)
      throw new HttpError(StatusCodes.BAD_REQUEST, "User ID is required");
    await this.userRepo.delete(id);
    this.sendSuccess(res, null, COMMON_MESSAGES.DELETED);
  });

  getReports = asyncHandler(async (req: Request, res: Response) => {
    this.logger.info("Fetching reports");
    const [userStats, orgStats] = await Promise.all([
      this.userRepo.getStats(),
      this.orgRepo.getStats(),
    ]);

    const report = {
      overview: {
        totalUsers: userStats.total,
        totalOrganizations: orgStats.total,
      },
      users: userStats,
      organizations: orgStats,
    };
    this.sendSuccess(res, report);
  });

  getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    this.logger.info("Fetching dashboard stats");
    const [userStats, orgStats] = await Promise.all([
      this.userRepo.getStats(),
      this.orgRepo.getStats(),
    ]);
    this.sendSuccess(res, { users: userStats, organizations: orgStats });
  });

  getUsersByOrganization = asyncHandler(async (req: Request, res: Response) => {
    const { orgId } = req.params;
    this.logger.info("Fetching users by organization", { orgId });
    const users = await this.userRepo.findByOrg(orgId);
    this.sendSuccess(res, users);
  });

  inviteMember = asyncHandler(async (req: Request, res: Response) => {
    const { email, orgId, role } = req.body;
    this.logger.info("Admin inviting member", { email, orgId, role });
    if (!email || !orgId)
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        COMMON_MESSAGES.INVALID_INPUT,
      );

    const result = await this.inviteMemberUseCase.execute(email, orgId, role);
    this.sendSuccess(
      res,
      result,
      COMMON_MESSAGES.INVITATION_SENT,
      StatusCodes.CREATED,
    );
  });

  bulkInviteMembers = asyncHandler(async (req: Request, res: Response) => {
    const { emails, orgId, role } = req.body;
    this.logger.info("Admin bulk inviting members", {
      count: emails?.length,
      orgId,
      role,
    });
    if (!emails?.length || !orgId)
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        COMMON_MESSAGES.INVALID_INPUT,
      );

    const result = await this.inviteMemberUseCase.bulkInvite(
      emails,
      orgId,
      role,
    );
    this.sendSuccess(res, result, COMMON_MESSAGES.INVITATION_SENT);
  });
}
