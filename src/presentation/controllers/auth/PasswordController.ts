import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { TYPES } from "../../../infrastructure/container/types";
import { IResetPasswordUseCase } from "../../../application/interface/useCases/IResetPasswordUseCase";
import { ISendOtpUseCase } from "../../../application/interface/useCases/ISendOtpUseCase";
import { IVerifyOtpUseCase } from "../../../application/interface/useCases/IVerifyOtpUseCase";
import { ILogger } from "../../../application/interface/services/ILogger";
import { COMMON_MESSAGES } from "../../../infrastructure/config/common.constants";
import { ResponseHandler } from "../../utils/ResponseHandler";
import { asyncHandler } from "../../../utils/asyncHandler";

@injectable()
export class PasswordController {
  constructor(
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
    @inject(TYPES.IResetPasswordUseCase)
    private readonly _resetPasswordUC: IResetPasswordUseCase,
    @inject(TYPES.IVerifyOtpUseCase) private _verifyOtpUC: IVerifyOtpUseCase,
    @inject(TYPES.ISendOtpUseCase) private _sendOtpUC: ISendOtpUseCase,
  ) {}

  resetPasswordReq = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    this._logger.info("Requesting password reset", { email });
    const result = await this._resetPasswordUC.requestReset(email);
    ResponseHandler.success(res, result, COMMON_MESSAGES.RESET_SENT);
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;
    this._logger.info("Resetting password", { token: "REDACTED" });
    const result = await this._resetPasswordUC.resetWithToken(token, password);
    ResponseHandler.success(res, result, COMMON_MESSAGES.RESET_SUCCESS);
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    await this._sendOtpUC.execute(email);
    ResponseHandler.success(res, null, COMMON_MESSAGES.OTP_SENT);
  });

  verifyResetOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const result = await this._verifyOtpUC.execute(email, otp);
    ResponseHandler.success(res, result, COMMON_MESSAGES.OTP_VERIFIED);
  });
}
