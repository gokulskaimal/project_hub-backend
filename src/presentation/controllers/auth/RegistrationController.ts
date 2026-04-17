import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { TYPES } from "../../../infrastructure/container/types";
import { IRegisterUseCase } from "../../../application/interface/useCases/IRegisterUseCase";
import { IVerifyEmailUseCase } from "../../../application/interface/useCases/IVerifyEmailUseCase";
import { IRegisterManagerUseCase } from "../../../application/interface/useCases/IRegisterManagerUseCase";
import { ISendOtpUseCase } from "../../../application/interface/useCases/ISendOtpUseCase";
import { IVerifyOtpUseCase } from "../../../application/interface/useCases/IVerifyOtpUseCase";
import { ICompleteSignupUseCase } from "../../../application/interface/useCases/ICompleteSignupUseCase";
import { ILogger } from "../../../application/interface/services/ILogger";
import { StatusCodes } from "../../../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../../../infrastructure/config/common.constants";
import { ResponseHandler } from "../../utils/ResponseHandler";
import { asyncHandler } from "../../../utils/asyncHandler";

@injectable()
export class RegistrationController {
  constructor(
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
    @inject(TYPES.IRegisterUseCase)
    private readonly _registerUC: IRegisterUseCase,
    @inject(TYPES.IVerifyEmailUseCase)
    private readonly _verifyEmailUC: IVerifyEmailUseCase,
    @inject(TYPES.IRegisterManagerUseCase)
    private readonly _registerManagerUC: IRegisterManagerUseCase,
    @inject(TYPES.ISendOtpUseCase) private readonly _sendOtpUC: ISendOtpUseCase,
    @inject(TYPES.IVerifyOtpUseCase)
    private readonly _verifyOtpUC: IVerifyOtpUseCase,
    @inject(TYPES.ICompleteSignupUseCase)
    private readonly _completeSignupUC: ICompleteSignupUseCase,
  ) {}

  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    this._logger.info("Registering new user", { email, name });
    const created = await this._registerUC.execute(email, password, name);
    ResponseHandler.success(
      res,
      created,
      COMMON_MESSAGES.SIGNUP_COMPLETE,
      StatusCodes.CREATED,
    );
  });

  registerManager = asyncHandler(async (req: Request, res: Response) => {
    const { email, organizationName } = req.body;
    this._logger.info("Registering manager", { email, organizationName });
    const result = await this._registerManagerUC.execute(
      email,
      organizationName,
    );
    ResponseHandler.success(
      res,
      result,
      "Manager registration initiated",
      StatusCodes.CREATED,
    );
  });

  sendOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    this._logger.info("Sending OTP", { email });
    const result = await this._sendOtpUC.execute(email);
    ResponseHandler.success(res, result, COMMON_MESSAGES.OTP_SENT);
  });

  verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    this._logger.info("Verifying OTP", { email });
    const result = await this._verifyOtpUC.execute(email, otp);
    ResponseHandler.success(res, result, COMMON_MESSAGES.OTP_VERIFIED);
  });

  completeSignup = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } = req.body;
    this._logger.info("Completing signup", { email, firstName, lastName });
    const result = await this._completeSignupUC.execute(
      email,
      password,
      firstName,
      lastName,
    );
    ResponseHandler.success(res, result, COMMON_MESSAGES.SIGNUP_COMPLETE);
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const token = req.body?.token || req.headers["x-verification-token"];
    this._logger.info("Verifying email", { token: "REDACTED" });
    const result = await this._verifyEmailUC.execute(String(token));
    ResponseHandler.success(res, result, COMMON_MESSAGES.EMAIL_VERIFIED);
  });
}
