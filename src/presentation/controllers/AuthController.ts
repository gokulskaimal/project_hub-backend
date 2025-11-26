import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { TYPES } from "../../infrastructure/container/types";
import { ILoginUseCase } from "../../domain/interfaces/useCases/ILoginUseCase";
import { IRegisterUseCase } from "../../domain/interfaces/useCases/IRegisterUseCase";
import { IGoogleSignInUseCase } from "../../domain/interfaces/useCases/IGoogleSignInUseCase";
import { ITokenRefreshUseCase } from "../../domain/interfaces/useCases/ITokenRefreshUseCase";
import { ILogoutUseCase } from "../../domain/interfaces/useCases/ILogoutUseCase";
import { IVerifyEmailUseCase } from "../../domain/interfaces/useCases/IVerifyEmailUseCase";
import { ILogger } from "../../domain/interfaces/services/ILogger";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../../infrastructure/config/common.constants";
import { IRegisterManagerUseCase } from "../../domain/interfaces/useCases/IRegisterManagerUseCase";
import { ISendOtpUseCase } from "../../domain/interfaces/useCases/ISendOtpUseCase";
import { IVerifyOtpUseCase } from "../../domain/interfaces/useCases/IVerifyOtpUseCase";
import { ICompleteSignupUseCase } from "../../domain/interfaces/useCases/ICompleteSignupUseCase";
import { IInviteMemberUseCase } from "../../domain/interfaces/useCases/IInviteMemberUseCase";
import { IAcceptUseCase } from "../../domain/interfaces/useCases/IAcceptUseCase";
import { IResetPasswordUseCase } from "../../domain/interfaces/useCases/IResetPasswordUseCase";
import { asyncHandler, HttpError } from "../../utils/asyncHandler";

@injectable()
export class AuthController {
  private readonly refreshCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  constructor(
    @inject(TYPES.ILogger) private readonly logger: ILogger,
    @inject(TYPES.ILoginUseCase) private readonly loginUC: ILoginUseCase,
    @inject(TYPES.IRegisterUseCase)
    private readonly registerUC: IRegisterUseCase,
    @inject(TYPES.IGoogleSignInUseCase)
    private readonly googleSignInUC: IGoogleSignInUseCase,
    @inject(TYPES.ITokenRefreshUseCase)
    private readonly tokenRefreshUC: ITokenRefreshUseCase,
    @inject(TYPES.ILogoutUseCase) private readonly logoutUC: ILogoutUseCase,
    @inject(TYPES.IVerifyEmailUseCase)
    private readonly verifyEmailUC: IVerifyEmailUseCase,
    @inject(TYPES.IRegisterManagerUseCase)
    private readonly registerManagerUC: IRegisterManagerUseCase,
    @inject(TYPES.ISendOtpUseCase) private readonly sendOtpUC: ISendOtpUseCase,
    @inject(TYPES.IVerifyOtpUseCase)
    private readonly verifyOtpUC: IVerifyOtpUseCase,
    @inject(TYPES.ICompleteSignupUseCase)
    private readonly completeSignupUC: ICompleteSignupUseCase,
    @inject(TYPES.IInviteMemberUseCase)
    private readonly inviteMemberUC: IInviteMemberUseCase,
    @inject(TYPES.IAcceptUseCase) private readonly acceptUC: IAcceptUseCase,
    @inject(TYPES.IResetPasswordUseCase)
    private resetPasswordUC: IResetPasswordUseCase,
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
    this.logger.info("Registering new user", { email, name });
    const created = await this.registerUC.execute(email, password, name);
    this.sendSuccess(
      res,
      created,
      COMMON_MESSAGES.SIGNUP_COMPLETE,
      StatusCodes.CREATED,
    );
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    this.logger.info("Login attempt", { email });
    const result = await this.loginUC.execute(email, password);

    if (result.tokens.refreshToken) {
      res.cookie(
        "refreshToken",
        result.tokens.refreshToken,
        this.refreshCookieOptions,
      );
    }
    this.logger.info("User logged in successfully", { userId: result.user.id });
    this.sendSuccess(
      res,
      { accessToken: result.tokens.accessToken, user: result.user },
      COMMON_MESSAGES.LOGIN_SUCCESS,
    );
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;
    this.logger.info("Refresh token attempt");
    if (!refreshToken) {
      this.logger.warn("Refresh token missing");
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ success: false, error: "Missing refresh token" });
      return;
    }
    const tokens = await this.tokenRefreshUC.execute(refreshToken);
    if (tokens.refreshToken) {
      res.cookie(
        "refreshToken",
        tokens.refreshToken,
        this.refreshCookieOptions,
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
    this.logger.info("Logout attempt");
    if (refreshToken) {
      try {
        await this.logoutUC.execute(refreshToken);
      } catch (err: unknown) {
        this.logger.warn("Logout revocation failed", {
          error: (err as Error)?.message ?? String(err),
        });
      }
    }
    res.clearCookie("refreshToken", { path: "/" });
    this.sendSuccess(res, null, COMMON_MESSAGES.LOGOUT_SUCCESS);
  });

  registerManager = asyncHandler(async (req: Request, res: Response) => {
    const { email, organizationName } = req.body;
    this.logger.info("Registering manager", { email, organizationName });
    const result = await this.registerManagerUC.execute(
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
    this.logger.info("Sending OTP", { email });
    const result = await this.sendOtpUC.execute(email);
    this.sendSuccess(res, result, COMMON_MESSAGES.OTP_SENT);
  });

  verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    this.logger.info("Verifying OTP", { email });
    const result = await this.verifyOtpUC.execute(email, otp);
    this.sendSuccess(res, result, COMMON_MESSAGES.OTP_VERIFIED);
  });

  completeSignup = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } = req.body;
    this.logger.info("Completing signup", { email, firstName, lastName });
    const result = await this.completeSignupUC.execute(
      email,
      password,
      firstName,
      lastName,
    );
    this.sendSuccess(res, result, COMMON_MESSAGES.SIGNUP_COMPLETE);
  });

  inviteMember = asyncHandler(async (req: Request, res: Response) => {
    const { email, orgId, role } = req.body;
    this.logger.info("Inviting member", { email, orgId, role });
    const result = await this.inviteMemberUC.execute(email, orgId, role);
    this.sendSuccess(
      res,
      result,
      COMMON_MESSAGES.INVITATION_SENT,
      StatusCodes.CREATED,
    );
  });

  acceptInvite = asyncHandler(async (req: Request, res: Response) => {
    const { token, password, firstName, lastName } = req.body;
    this.logger.info("Accepting invite", {
      token: "REDACTED",
      firstName,
      lastName,
    });
    const result = await this.acceptUC.execute(
      token,
      password,
      firstName,
      lastName,
    );
    this.sendSuccess(res, result, COMMON_MESSAGES.ACCEPTED);
  });

  validateInviteToken = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    this.logger.info("Validating invite token", { token: "REDACTED" });
    const result = await this.acceptUC.validateInvitationToken(token);
    this.sendSuccess(res, result, "Token validation result");
  });

  resetPasswordReq = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    this.logger.info("Requesting password reset", { email });
    const result = await this.resetPasswordUC.requestReset(email);
    this.sendSuccess(res, result, COMMON_MESSAGES.RESET_SENT);
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;
    this.logger.info("Resetting password", { token: "REDACTED" });
    const result = await this.resetPasswordUC.resetWithToken(token, password);
    this.sendSuccess(res, result, COMMON_MESSAGES.RESET_SUCCESS);
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const token = req.body?.token || req.headers["x-verification-token"];
    this.logger.info("Verifying email", { token: "REDACTED" });
    const result = await this.verifyEmailUC.execute(String(token));
    this.sendSuccess(res, result, COMMON_MESSAGES.EMAIL_VERIFIED);
  });

  googleSignIn = asyncHandler(async (req: Request, res: Response) => {
    const { idToken, inviteToken, orgName } = req.body;
    this.logger.info("Google Sign-In attempt", {
      hasInviteToken: !!inviteToken,
      orgName,
    });

    try {
      const result = await this.googleSignInUC.execute(
        idToken,
        inviteToken,
        orgName,
      );
      if (result.tokens.refreshToken) {
        res.cookie(
          "refreshToken",
          result.tokens.refreshToken,
          this.refreshCookieOptions,
        );
      }
      this.logger.info("Google Sign-In successful", { userId: result.user.id });
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
