import { Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IOrganizationManagementUseCase } from "../../application/interface/useCases/IOrganizationManagementUseCase";
import { IOrganizationQueryUseCase } from "../../application/interface/useCases/IOrganizationQueryUseCase";
import { AuthenticatedRequest } from "../middleware/types/AuthenticatedRequest";
import { IUserQueryUseCase } from "../../application/interface/useCases/IUserQueryUseCase";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
import { asyncHandler } from "../middleware/ErrorMiddleware";

@injectable()
export class OrganizationController {
  constructor(
    @inject(TYPES.IOrganizationManagementUseCase)
    private _orgManagement: IOrganizationManagementUseCase,
    @inject(TYPES.IOrganizationQueryUseCase)
    private _orgQuery: IOrganizationQueryUseCase,
    @inject(TYPES.IUserQueryUseCase) private _userQuery: IUserQueryUseCase,
  ) {}

  private sendSuccess<T>(res: Response, data: T, message: string = "Success") {
    res.status(StatusCodes.OK).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  getMyOrganization = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const orgId = req.user?.orgId;
      if (!orgId)
        throw {
          status: StatusCodes.BAD_REQUEST,
          message: "No Organization ID found",
        };

      const org = await this._orgQuery.getOrganizationById(orgId);
      if (!org)
        throw {
          status: StatusCodes.NOT_FOUND,
          message: "Organization not found",
        };

      this.sendSuccess(res, org, "Organization details retrieved");
    },
  );

  updateOrganization = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const orgId = req.user?.orgId;
      const { name } = req.body;

      if (!orgId)
        throw {
          status: StatusCodes.BAD_REQUEST,
          message: "No Organization ID found",
        };
      if (!name)
        throw {
          status: StatusCodes.BAD_REQUEST,
          message: "Organization name is required",
        };

      const updated = await this._orgManagement.updateOrganization(
        orgId,
        { name },
        req.user!.id,
      );
      this.sendSuccess(res, updated, "Organization updated successfully");
    },
  );

  getOrganizationUsers = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const orgId = req.user?.orgId;
      if (!orgId)
        throw {
          status: StatusCodes.BAD_REQUEST,
          message: "No Organization ID found",
        };

      const users = await this._userQuery.getUsersByOrganization(
        orgId,
        req.user!.id,
      );
      this.sendSuccess(res, users, "Organization users retrieved");
    },
  );
}
