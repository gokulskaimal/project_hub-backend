import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { TYPES } from "../../../infrastructure/container/types";
import { IResetPasswordUseCase } from "../../../application/interface/useCases/IResetPasswordUseCase";
import { ILogger } from "../../../application/interface/services/ILogger";
import { StatusCodes } from "../../../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../../../infrastructure/config/common.constants";
import { asyncHandler } from "../../../utils/asyncHandler";

@injectable()
export class PasswordController {
  constructor(
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
    @inject(TYPES.IResetPasswordUseCase)
    private readonly _resetPasswordUC: IResetPasswordUseCase,
  ) {}

  private sendSuccess(
    res: Response,
    data: unknown,
    message: string = "Success",
    status: number = StatusCodes.OK,
  ) {
    res.status(status).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  resetPasswordReq = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    this._logger.info("Requesting password reset", { email });
    const result = await this._resetPasswordUC.requestReset(email);
    this.sendSuccess(res, result, COMMON_MESSAGES.RESET_SENT);
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;
    this._logger.info("Resetting password", { token: "REDACTED" });
    const result = await this._resetPasswordUC.resetWithToken(token, password);
    this.sendSuccess(res, result, COMMON_MESSAGES.RESET_SUCCESS);
  });
}
