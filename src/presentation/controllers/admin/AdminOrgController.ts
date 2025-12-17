import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../infrastructure/container/types";
import { IOrganizationQueryUseCase } from "../../../application/interface/useCases/IOrganizationQueryUseCase";
import { IOrganizationManagementUseCase } from "../../../application/interface/useCases/IOrganizationManagementUseCase";
import { IUserQueryUseCase } from "../../../application/interface/useCases/IUserQueryUseCase";
import { IInviteMemberUseCase } from "../../../application/interface/useCases/IInviteMemberUseCase";
import { IAdminStatsUseCase } from "../../../application/interface/useCases/IAdminStatsUseCase";
import { ILogger } from "../../../infrastructure/interface/services/ILogger";
import { OrganizationStatus } from "../../../domain/entities/Organization";
import { StatusCodes } from "../../../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../../../infrastructure/config/common.constants";
import { asyncHandler } from "../../middleware/ErrorMiddleware";
import { EntityNotFoundError, ValidationError } from "../../../domain/errors/CommonErrors";
import { toOrgDTO } from "../../../application/dto/OrgDTO";
import { toUserDTO } from "../../../application/dto/UserDTO";

@injectable()
export class AdminOrgController {
  constructor(
    @inject(TYPES.IOrganizationQueryUseCase)
    private _orgQueryUseCase: IOrganizationQueryUseCase,
    @inject(TYPES.IOrganizationManagementUseCase)
    private _orgManagementUseCase: IOrganizationManagementUseCase,
    @inject(TYPES.IUserQueryUseCase)
    private _userQueryUseCase: IUserQueryUseCase,
    @inject(TYPES.IInviteMemberUseCase)
    private _inviteMemberUseCase: IInviteMemberUseCase,
    @inject(TYPES.IAdminStatsUseCase)
    private _adminStatsUseCase: IAdminStatsUseCase,
    @inject(TYPES.ILogger) private logger: ILogger,
  ) { }

  private sendSuccess<T>(
    res: Response,
    data: T,
    message: string = "Success",
    status: number = StatusCodes.OK,
  ): void {
    res.status(status).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  listOrganizations = asyncHandler(async (req: Request, res: Response) => {
    const { limit = 50, offset = 0, search } = req.query;
    this.logger.info("Listing organizations", { limit, offset, search });

    const result = await this._orgQueryUseCase.listOrganizations(
      Number(limit),
      Number(offset),
      search as string,
    );
    const safeResult = {
      ...result,
      organizations: result.organizations.map(toOrgDTO),
    };
    this.sendSuccess(res, safeResult);
  });

  createOrganization = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, settings } = req.body;
    this.logger.info("Creating organization", { name });
    if (!name)
    if (!name)
      throw new ValidationError("Organization name is required");

    const newOrg = await this._orgManagementUseCase.createOrganization({
      name,
      description,
      settings: settings || {},
      status: OrganizationStatus.ACTIVE,
      createdAt: new Date(),
    });
    this.sendSuccess(res, toOrgDTO(newOrg), COMMON_MESSAGES.CREATED, StatusCodes.CREATED);
  });

  getOrganizationById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.info("Fetching organization by ID", { orgId: id });
    const organization = await this._orgQueryUseCase.getOrganizationById(id);
    if (!organization)
      throw new EntityNotFoundError("Organization", id);
    this.sendSuccess(res, toOrgDTO(organization));
  });

  updateOrganization = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;
    this.logger.info("Updating organization", {
      orgId: id,
      updatedFields: Object.keys(updateData || {}),
    });
    if (!id)
      throw new ValidationError("Organization ID is required");
    if (!updateData)
      throw new ValidationError("Update data is required");

    // If status is being updated, use the status-specific method for side effects
    if (updateData.status) {
      const updatedOrg =
        await this._orgManagementUseCase.updateOrganizationStatus(
          id,
          updateData.status,
        );

      const { status: _status, ...otherFields } = updateData;

      // If there are other fields, update them as well
      if (Object.keys(otherFields).length > 0) {
        const finalOrg = await this._orgManagementUseCase.updateOrganization(id, otherFields);
        this.sendSuccess(res, toOrgDTO(finalOrg), COMMON_MESSAGES.UPDATED);
        return;
      }

      this.sendSuccess(res, toOrgDTO(updatedOrg), COMMON_MESSAGES.UPDATED);
      return;
    }

    // Generic update
    const updatedOrg = await this._orgManagementUseCase.updateOrganization(id, updateData);
    this.sendSuccess(res, toOrgDTO(updatedOrg), COMMON_MESSAGES.UPDATED);
  });

  deleteOrganization = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.info("Deleting organization", { orgId: id });
    if (!id)
      throw new ValidationError("Organization ID is required");

    await this._orgManagementUseCase.deleteOrganizationCascade(id);
    this.sendSuccess(res, null, COMMON_MESSAGES.DELETED);
  });

  getUsersByOrganization = asyncHandler(async (req: Request, res: Response) => {
    const { orgId } = req.params;
    this.logger.info("Fetching users by organization", { orgId });
    const users = await this._userQueryUseCase.getUsersByOrganization(orgId);
    this.sendSuccess(res, users.map(toUserDTO));
  });

  inviteMember = asyncHandler(async (req: Request, res: Response) => {
    const { email, orgId, role } = req.body;
    this.logger.info("Admin inviting member", { email, orgId, role });
    if (!email || !orgId)
    if (!email || !orgId)
      throw new ValidationError(COMMON_MESSAGES.INVALID_INPUT);

    const result = await this._inviteMemberUseCase.execute(email, orgId, role);
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
    if (!emails?.length || !orgId)
      throw new ValidationError(COMMON_MESSAGES.INVALID_INPUT);

    const result = await this._inviteMemberUseCase.bulkInvite(
      emails,
      orgId,
      role,
    );
    this.sendSuccess(res, result, COMMON_MESSAGES.INVITATION_SENT);
  });

  getReports = asyncHandler(async (req: Request, res: Response) => {
    this.logger.info("Fetching reports");
    const report = await this._adminStatsUseCase.getReports();
    this.sendSuccess(res, report);
  });

  getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    this.logger.info("Fetching dashboard stats");
    const stats = await this._adminStatsUseCase.getDashboardStats();
    this.sendSuccess(res, stats);
  });
}
