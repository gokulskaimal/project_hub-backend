import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../infrastructure/container/types";
import { IOrganizationQueryUseCase } from "../../../application/interface/useCases/IOrganizationQueryUseCase";
import { IOrganizationManagementUseCase } from "../../../application/interface/useCases/IOrganizationManagementUseCase";
import { IUserQueryUseCase } from "../../../application/interface/useCases/IUserQueryUseCase";
import { IInviteMemberUseCase } from "../../../application/interface/useCases/IInviteMemberUseCase";
import { IAdminStatsUseCase } from "../../../application/interface/useCases/IAdminStatsUseCase";
import { IGetAdminAnalyticsUseCase } from "../../../application/interface/useCases/IGetAdminAnalyticsUseCase";
import { ILogger } from "../../../application/interface/services/ILogger";
import { TimeFrame } from "../../../utils/DateUtils";
import { AuthenticatedRequest } from "../../middleware/types/AuthenticatedRequest";
import { Organization } from "../../../domain/entities/Organization";
import { StatusCodes } from "../../../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../../../infrastructure/config/common.constants";
import { toOrgDTO } from "../../../application/dto/OrgDTO";
import { ResponseHandler } from "../../utils/ResponseHandler";
import { asyncHandler } from "../../../utils/asyncHandler";
import {
  OrgCreateSchema,
  OrgUpdateSchema,
  InviteMemberSchema,
  BulkInviteSchema,
} from "../../../application/dto/ValidationSchemas";

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
    @inject(TYPES.IGetAdminAnalyticsUseCase)
    private _adminAnalyticsUseCase: IGetAdminAnalyticsUseCase,
    @inject(TYPES.ILogger) private logger: ILogger,
  ) {}

  listOrganizations = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;
    const { search, status } = req.query;

    this.logger.info("Listing Organizations", { limit, page, offset, status });
    const result = await this._orgQueryUseCase.listOrganizations(
      limit,
      offset,
      search as string,
      status as string,
    );

    ResponseHandler.success(
      res,
      {
        items: result.organizations.map(toOrgDTO),
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
      "Organizations fetched successfully",
    );
  });

  createOrganization = asyncHandler(async (req: Request, res: Response) => {
    const validation = OrgCreateSchema.safeParse(req.body);
    if (!validation.success) {
      return ResponseHandler.validationError(res, validation.error.format());
    }
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return ResponseHandler.unauthorized(res, "Unauthorized");
    }

    const newOrg = await this._orgManagementUseCase.createOrganization(
      validation.data,
      authReq.user!.id,
    );
    ResponseHandler.success(
      res,
      toOrgDTO(newOrg),
      COMMON_MESSAGES.CREATED,
      StatusCodes.CREATED,
    );
  });

  getOrganizationById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.info("Fetching organization by ID", { orgId: id });
    const organization = await this._orgQueryUseCase.getOrganizationById(
      id,
      (req as AuthenticatedRequest).user!.id,
    );
    if (!organization) {
      return ResponseHandler.notFound(res, "Organization not found");
    }
    ResponseHandler.success(res, toOrgDTO(organization));
  });

  updateOrganization = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return ResponseHandler.unauthorized(res, "Unauthorized");
    }

    const { id } = req.params;
    if (!id) {
      return ResponseHandler.validationError(
        res,
        "Organization ID is required",
      );
    }

    const validation = OrgUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return ResponseHandler.validationError(res, validation.error.format());
    }
    const updateData = validation.data;
    this.logger.info("Updating organization", {
      orgId: id,
      updatedFields: Object.keys(updateData || {}),
    });

    // Generic update
    const updatedOrg = await this._orgManagementUseCase.updateOrganization(
      id,
      updateData as Partial<Organization>,
      authReq.user!.id,
    );
    ResponseHandler.success(res, toOrgDTO(updatedOrg), COMMON_MESSAGES.UPDATED);
  });

  deleteOrganization = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return ResponseHandler.unauthorized(res, "Unauthorized");
    }

    const { id } = req.params;
    this.logger.info("Deleting organization", { orgId: id });
    if (!id) {
      return ResponseHandler.validationError(
        res,
        "Organization ID is required",
      );
    }

    await this._orgManagementUseCase.deleteOrganizationCascade(
      id,
      authReq.user.id,
    );
    ResponseHandler.success(res, null, COMMON_MESSAGES.DELETED);
  });

  inviteMember = asyncHandler(async (req: Request, res: Response) => {
    const validation = InviteMemberSchema.safeParse(req.body);
    if (!validation.success) {
      return ResponseHandler.validationError(res, validation.error.format());
    }
    const { email, orgId, role } = validation.data;
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return ResponseHandler.unauthorized(res, "Unauthorized");
    }

    this.logger.info("Admin inviting member", { email, orgId, role });

    const result = await this._inviteMemberUseCase.execute(
      email,
      orgId,
      authReq.user.id,
      role,
    );
    const safeResult = {
      ...result,
      expiresAt: result.expiresAt.toISOString(),
    };
    ResponseHandler.success(
      res,
      safeResult,
      COMMON_MESSAGES.INVITATION_SENT,
      StatusCodes.CREATED,
    );
  });

  bulkInviteMembers = asyncHandler(async (req: Request, res: Response) => {
    const validation = BulkInviteSchema.safeParse(req.body);
    if (!validation.success) {
      return ResponseHandler.validationError(res, validation.error.format());
    }

    const { emails, orgId, role } = validation.data;
    this.logger.info("Admin bulk inviting members", {
      count: emails?.length,
      orgId,
      role,
    });

    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return ResponseHandler.unauthorized(res, "Unauthorized");
    }

    const result = await this._inviteMemberUseCase.bulkInvite(
      emails,
      orgId,
      authReq.user.id,
      role,
    );
    ResponseHandler.success(res, result, COMMON_MESSAGES.INVITATION_SENT);
  });

  getReports = asyncHandler(async (req: Request, res: Response) => {
    this.logger.info("Fetching reports");
    const report = await this._adminStatsUseCase.getReports();
    ResponseHandler.success(res, report);
  });

  getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    this.logger.info("Fetching dashboard stats");
    const stats = await this._adminStatsUseCase.getDashboardStats();
    ResponseHandler.success(res, stats);
  });

  getAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { filter } = req.query;
    this.logger.info("Fetching admin analytics", { filter });
    const analytics = await this._adminAnalyticsUseCase.execute(
      filter as TimeFrame,
    );
    ResponseHandler.success(res, analytics);
  });
}
