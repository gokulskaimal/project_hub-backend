import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { TYPES } from "../../infrastructure/container/types";
import { ILoginUseCase } from "../../application/interface/useCases/ILoginUseCase";
import { IRegisterUseCase } from "../../application/interface/useCases/IRegisterUseCase";
import { IGoogleSignInUseCase } from "../../application/interface/useCases/IGoogleSignInUseCase";
import { ITokenRefreshUseCase } from "../../application/interface/useCases/ITokenRefreshUseCase";
import { ILogoutUseCase } from "../../application/interface/useCases/ILogoutUseCase";
import { IVerifyEmailUseCase } from "../../application/interface/useCases/IVerifyEmailUseCase";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../../infrastructure/config/common.constants";
import { IRegisterManagerUseCase } from "../../application/interface/useCases/IRegisterManagerUseCase";
import { ISendOtpUseCase } from "../../application/interface/useCases/ISendOtpUseCase";
import { IVerifyOtpUseCase } from "../../application/interface/useCases/IVerifyOtpUseCase";
import { ICompleteSignupUseCase } from "../../application/interface/useCases/ICompleteSignupUseCase";
import { IInviteMemberUseCase } from "../../application/interface/useCases/IInviteMemberUseCase";
import { IAcceptUseCase } from "../../application/interface/useCases/IAcceptUseCase";
import { IResetPasswordUseCase } from "../../application/interface/useCases/IResetPasswordUseCase";
import { asyncHandler, HttpError } from "../../utils/asyncHandler";

@injectable()
export class AuthController {
  private readonly _refreshCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  constructor(
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
    @inject(TYPES.ILoginUseCase) private readonly _loginUC: ILoginUseCase,
    @inject(TYPES.IRegisterUseCase)
    private readonly _registerUC: IRegisterUseCase,
    @inject(TYPES.IGoogleSignInUseCase)
    private readonly _googleSignInUC: IGoogleSignInUseCase,
    @inject(TYPES.ITokenRefreshUseCase)
    private readonly _tokenRefreshUC: ITokenRefreshUseCase,
    @inject(TYPES.ILogoutUseCase) private readonly _logoutUC: ILogoutUseCase,
    @inject(TYPES.IVerifyEmailUseCase)
    private readonly _verifyEmailUC: IVerifyEmailUseCase,
    @inject(TYPES.IRegisterManagerUseCase)
    private readonly _registerManagerUC: IRegisterManagerUseCase,
    @inject(TYPES.ISendOtpUseCase) private readonly _sendOtpUC: ISendOtpUseCase,
    @inject(TYPES.IVerifyOtpUseCase)
    private readonly _verifyOtpUC: IVerifyOtpUseCase,
    @inject(TYPES.ICompleteSignupUseCase)
    private readonly _completeSignupUC: ICompleteSignupUseCase,
    @inject(TYPES.IInviteMemberUseCase)
    private readonly _inviteMemberUC: IInviteMemberUseCase,
    @inject(TYPES.IAcceptUseCase) private readonly _acceptUC: IAcceptUseCase,
    @inject(TYPES.IResetPasswordUseCase)
    private readonly _resetPasswordUC: IResetPasswordUseCase,
  ) {}

  // Helper to send standard success response
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

  register = asyncHandler(async (req: Request, res: Response) => {
    // Input already validated by middleware
    const { email, password, name } = req.body;
    this._logger.info("Registering new user", { email, name });
    const created = await this._registerUC.execute(email, password, name);
    this.sendSuccess(
      res,
      created,
      COMMON_MESSAGES.SIGNUP_COMPLETE,
      StatusCodes.CREATED,
    );
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    this._logger.info("Login attempt", { email });
    const result = await this._loginUC.execute(email, password);

    if (result.tokens.refreshToken) {
      res.cookie(
        "refreshToken",
        result.tokens.refreshToken,
        this._refreshCookieOptions,
      );
    }
    this._logger.info("User logged in successfully", {
      userId: result.user.id,
    });
    this.sendSuccess(
      res,
      { accessToken: result.tokens.accessToken, user: result.user },
      COMMON_MESSAGES.LOGIN_SUCCESS,
    );
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;
    this._logger.info("Refresh token attempt");
    if (!refreshToken) {
      this._logger.warn("Refresh token missing");
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ success: false, error: "Missing refresh token" });
      return;
    }
    const tokens = await this._tokenRefreshUC.execute(refreshToken);
    if (tokens.refreshToken) {
      res.cookie(
        "refreshToken",
        tokens.refreshToken,
        this._refreshCookieOptions,
      );
    }
    this.sendSuccess(
      res,
      { accessToken: tokens.accessToken },
      COMMON_MESSAGES.TOKEN_REFRESHED,
    );
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;
    this._logger.info("Logout attempt");
    if (refreshToken) {
      try {
        await this._logoutUC.execute(refreshToken);
      } catch (err: unknown) {
        this._logger.warn("Logout revocation failed", {
          error: (err as Error)?.message ?? String(err),
        });
      }
    }
    res.clearCookie("refreshToken", { path: "/" });
    this.sendSuccess(res, null, COMMON_MESSAGES.LOGOUT_SUCCESS);
  });

  registerManager = asyncHandler(async (req: Request, res: Response) => {
    const { email, organizationName } = req.body;
    this._logger.info("Registering manager", { email, organizationName });
    const result = await this._registerManagerUC.execute(
      email,
      organizationName,
    );
    this.sendSuccess(
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
    this.sendSuccess(res, result, COMMON_MESSAGES.OTP_SENT);
  });

  verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    this._logger.info("Verifying OTP", { email });
    const result = await this._verifyOtpUC.execute(email, otp);
    this.sendSuccess(res, result, COMMON_MESSAGES.OTP_VERIFIED);
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
    this.sendSuccess(res, result, COMMON_MESSAGES.SIGNUP_COMPLETE);
  });

  inviteMember = asyncHandler(async (req: Request, res: Response) => {
    const { email, orgId, role } = req.body;
    this._logger.info("Inviting member", { email, orgId, role });
    const result = await this._inviteMemberUC.execute(email, orgId, role);
    this.sendSuccess(
      res,
      result,
      COMMON_MESSAGES.INVITATION_SENT,
      StatusCodes.CREATED,
    );
  });

  acceptInvite = asyncHandler(async (req: Request, res: Response) => {
    const { token, password, firstName, lastName } = req.body;
    this._logger.info("Accepting invite", {
      token: "REDACTED",
      firstName,
      lastName,
    });
    const result = await this._acceptUC.execute(
      token,
      password,
      firstName,
      lastName,
    );
    this.sendSuccess(res, result, COMMON_MESSAGES.ACCEPTED);
  });

  validateInviteToken = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    this._logger.info("Validating invite token", { token: "REDACTED" });
    const result = await this._acceptUC.validateInvitationToken(token);
    this.sendSuccess(res, result, "Token validation result");
  });

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

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const token = req.body?.token || req.headers["x-verification-token"];
    this._logger.info("Verifying email", { token: "REDACTED" });
    const result = await this._verifyEmailUC.execute(String(token));
    this.sendSuccess(res, result, COMMON_MESSAGES.EMAIL_VERIFIED);
  });

  googleSignIn = asyncHandler(async (req: Request, res: Response) => {
    const { idToken, inviteToken, orgName } = req.body;
    this._logger.info("Google Sign-In attempt", {
      hasInviteToken: !!inviteToken,
      orgName,
    });

    try {
      const result = await this._googleSignInUC.execute(
        idToken,
        inviteToken,
        orgName,
      );
      if (result.tokens.refreshToken) {
        res.cookie(
          "refreshToken",
          result.tokens.refreshToken,
          this._refreshCookieOptions,
        );
      }
      this._logger.info("Google Sign-In successful", {
        userId: result.user.id,
      });
      this.sendSuccess(
        res,
        { accessToken: result.tokens.accessToken, user: result.user },
        COMMON_MESSAGES.LOGIN_SUCCESS,
      );
    } catch (error: unknown) {
      const msg = (error as Error)?.message ?? String(error);
      if (msg === "Organization Name Required") {
        throw new HttpError(
          StatusCodes.BAD_REQUEST,
          "Organization Name Required",
        );
      }
      throw error;
    }
  });
}
