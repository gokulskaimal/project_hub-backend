import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IOrganizationManagementUseCase } from "../../application/interface/useCases/IOrganizationManagementUseCase";
import { IOrganizationQueryUseCase } from "../../application/interface/useCases/IOrganizationQueryUseCase";
import { AuthenticatedRequest } from "../middleware/types/AuthenticatedRequest";
import { IUserQueryUseCase } from "../../application/interface/useCases/IUserQueryUseCase";
import { ResponseHandler } from "../utils/ResponseHandler";
import { asyncHandler } from "../../utils/asyncHandler";
import { COMMON_MESSAGES } from "../../infrastructure/config/common.constants";

@injectable()
export class OrganizationController {
  constructor(
    @inject(TYPES.IOrganizationManagementUseCase)
    private _orgManagementUC: IOrganizationManagementUseCase,
    @inject(TYPES.IOrganizationQueryUseCase)
    private _orgQueryUC: IOrganizationQueryUseCase,
    @inject(TYPES.IUserQueryUseCase) private _userQueryUC: IUserQueryUseCase,
  ) {}

  getMyOrganization = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const orgId = req.user?.orgId;
      if (!orgId) {
        return ResponseHandler.notFound(res, COMMON_MESSAGES.NOT_FOUND);
      }

      const org = await this._orgQueryUC.getOrganizationById(
        orgId,
        req.user!.id,
      );
      if (!org) {
        return ResponseHandler.notFound(res, COMMON_MESSAGES.NOT_FOUND);
      }

      ResponseHandler.success(res, org, "Organization details retrieved");
    },
  );

  updateOrganization = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const orgId = req.user?.orgId;
      const { name } = req.body;

      if (!orgId)
        return ResponseHandler.notFound(res, COMMON_MESSAGES.NOT_FOUND);
      if (!name)
        return ResponseHandler.validationError(
          res,
          "Organization name is required",
        );

      const updated = await this._orgManagementUC.updateOrganization(
        orgId,
        { name },
        req.user!.id,
      );
      ResponseHandler.success(
        res,
        updated,
        "Organization updated successfully",
      );
    },
  );

  getOrganizationUsers = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const orgId = req.user?.orgId;
      if (!orgId)
        return ResponseHandler.notFound(res, COMMON_MESSAGES.NOT_FOUND);

      const users = await this._userQueryUC.getUsersByOrganization(
        orgId,
        req.user!.id,
      );
      ResponseHandler.success(res, users, "Organization users retrieved");
    },
  );

  getSettings = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const organization = await this._orgQueryUC.getOrganizationById(
      authReq.user!.orgId!,
      authReq.user!.id,
    );
    if (!organization)
      return ResponseHandler.notFound(res, "Organization not found");

    ResponseHandler.success(res, organization.settings);
  });

  updateSettings = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const orgId = authReq.user?.orgId;
    const updateOrg = await this._orgManagementUC.updateOrganization(
      orgId!,
      { settings: req.body },
      authReq.user!.id!,
    );
    ResponseHandler.success(res, updateOrg, "Settings updated successfully");
  });
}
