import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../infrastructure/container/types";
import { IUserQueryUseCase } from "../../../application/interface/useCases/IUserQueryUseCase";
import { IUserManagementUseCase } from "../../../application/interface/useCases/IUserManagementUseCase";
import { ILogger } from "../../../application/interface/services/ILogger";
import { COMMON_MESSAGES } from "../../../infrastructure/config/common.constants";
import { ResponseHandler } from "../../utils/ResponseHandler";
import { asyncHandler } from "../../../utils/asyncHandler";
import { toUserDTO } from "../../../application/dto/UserDTO";
import { AuthenticatedRequest } from "../../middleware/types/AuthenticatedRequest";

@injectable()
export class AdminUserController {
  constructor(
    @inject(TYPES.IUserQueryUseCase)
    private _userQueryUseCase: IUserQueryUseCase,
    @inject(TYPES.IUserManagementUseCase)
    private _userManagementUseCase: IUserManagementUseCase,
    @inject(TYPES.ILogger) private logger: ILogger,
  ) {}

  listUsers = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const { search, orgId, role, status } = req.query;

    this.logger.info("Listing User", { limit, page, offset });

    const filters = {
      orgId: typeof orgId == "string" ? orgId : undefined,
      role: typeof role == "string" ? role : undefined,
      status: typeof status == "string" ? status : undefined,
    };

    const authReq = req as AuthenticatedRequest;
    const result = await this._userQueryUseCase.listUsers(
      limit,
      offset,
      authReq.user!.id,
      search as string,
      filters,
    );

    ResponseHandler.success(
      res,
      {
        items: result.users.map(toUserDTO),
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
      "Users lisited successfully",
    );
  });

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.info("Fetching user by ID", { userId: id });
    if (!id) {
      return ResponseHandler.validationError(res, "User ID is required");
    }
    const authReq = req as AuthenticatedRequest;
    const user = await this._userQueryUseCase.getUserById(id, authReq.user!.id);
    if (!user) {
      return ResponseHandler.notFound(res, "User not found");
    }

    ResponseHandler.success(res, toUserDTO(user));
  });

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.info("Updating user", { userId: id });
    if (!id) {
      return ResponseHandler.validationError(res, "User ID is required");
    }

    const safeUpdateData = {
      ...(req.body as Record<string, unknown>),
    } as Record<string, unknown>;

    // Extra safety: Prevent updating password/otp via this endpoint
    Reflect.deleteProperty(safeUpdateData, "password");
    Reflect.deleteProperty(safeUpdateData, "otp");

    const authReq = req as AuthenticatedRequest;
    const updatedUser = await this._userManagementUseCase.updateUser(
      id,
      safeUpdateData,
      authReq.user!.id,
    );
    if (!updatedUser) {
      return ResponseHandler.notFound(res, "User not found");
    }

    ResponseHandler.success(
      res,
      toUserDTO(updatedUser),
      COMMON_MESSAGES.UPDATED,
    );
  });

  updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    this.logger.info("Updating user status", { userId: id, status });
    if (!id) {
      return ResponseHandler.validationError(res, "User ID is required");
    }
    if (!status) {
      return ResponseHandler.validationError(res, "Status is required");
    }

    const authReq = req as AuthenticatedRequest;
    const updatedUser = await this._userManagementUseCase.updateUserStatus(
      id,
      status,
      authReq.user!.id,
    );
    ResponseHandler.success(
      res,
      toUserDTO(updatedUser),
      COMMON_MESSAGES.UPDATED,
    );
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.info("Deleting user", { userId: id });
    if (!id) {
      return ResponseHandler.validationError(res, "User ID is required");
    }
    const authReq = req as AuthenticatedRequest;
    await this._userManagementUseCase.deleteUser(id, authReq.user!.id);
    ResponseHandler.success(res, null, COMMON_MESSAGES.DELETED);
  });
}
