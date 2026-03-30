import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../infrastructure/container/types";
import { IUserQueryUseCase } from "../../../application/interface/useCases/IUserQueryUseCase";
import { IUserManagementUseCase } from "../../../application/interface/useCases/IUserManagementUseCase";
import { ILogger } from "../../../application/interface/services/ILogger";
import { StatusCodes } from "../../../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../../../infrastructure/config/common.constants";
import { asyncHandler } from "../../middleware/ErrorMiddleware";
import {
  EntityNotFoundError,
  ValidationError,
} from "../../../domain/errors/CommonErrors";
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

    const filters = {
      orgId: typeof orgId === "string" ? orgId : undefined,
      role: typeof role === "string" ? role : undefined,
      status: typeof status === "string" ? status : undefined,
    };

    const authReq = req as AuthenticatedRequest;
    const result = await this._userQueryUseCase.listUsers(
      Number(limit),
      Number(offset),
      authReq.user!.id,
      search as string,
      filters,
    );

    const safeResult = {
      ...result,
      users: result.users.map(toUserDTO),
    };
    this.sendSuccess(res, safeResult);
  });

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.info("Fetching user by ID", { userId: id });
    if (!id) throw new ValidationError("User ID is required");

    const authReq = req as AuthenticatedRequest;
    const user = await this._userQueryUseCase.getUserById(id, authReq.user!.id);
    if (!user) throw new EntityNotFoundError("User", id);

    this.sendSuccess(res, toUserDTO(user));
  });

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.info("Updating user", { userId: id });
    if (!id) throw new ValidationError("User ID is required");

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
    if (!updatedUser) throw new EntityNotFoundError("User", id);

    this.sendSuccess(res, toUserDTO(updatedUser), COMMON_MESSAGES.UPDATED);
  });

  updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    this.logger.info("Updating user status", { userId: id, status });
    if (!id) throw new ValidationError("User ID is required");
    if (!status) throw new ValidationError(COMMON_MESSAGES.INVALID_INPUT);

    const authReq = req as AuthenticatedRequest;
    const updatedUser = await this._userManagementUseCase.updateUserStatus(
      id,
      status,
      authReq.user!.id,
    );
    this.sendSuccess(res, toUserDTO(updatedUser), COMMON_MESSAGES.UPDATED);
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.info("Deleting user", { userId: id });
    if (!id) throw new ValidationError("User ID is required");
    const authReq = req as AuthenticatedRequest;
    await this._userManagementUseCase.deleteUser(id, authReq.user!.id);
    this.sendSuccess(res, null, COMMON_MESSAGES.DELETED);
  });
}
