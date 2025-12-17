
import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { TYPES } from "../../../infrastructure/container/types";
import { ILoginUseCase } from "../../../application/interface/useCases/ILoginUseCase";
import { IGoogleSignInUseCase } from "../../../application/interface/useCases/IGoogleSignInUseCase";
import { ITokenRefreshUseCase } from "../../../application/interface/useCases/ITokenRefreshUseCase";
import { ILogoutUseCase } from "../../../application/interface/useCases/ILogoutUseCase";
import { ILogger } from "../../../infrastructure/interface/services/ILogger";
import { StatusCodes } from "../../../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../../../infrastructure/config/common.constants";
import { ValidationError } from "../../../domain/errors/CommonErrors";
import { asyncHandler } from "../../middleware/ErrorMiddleware";

@injectable()
export class SessionController {
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
    @inject(TYPES.IGoogleSignInUseCase)
    private readonly _googleSignInUC: IGoogleSignInUseCase,
    @inject(TYPES.ITokenRefreshUseCase)
    private readonly _tokenRefreshUC: ITokenRefreshUseCase,
    @inject(TYPES.ILogoutUseCase) private readonly _logoutUC: ILogoutUseCase,
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
        throw new ValidationError("Organization Name Required");
      }
      throw error;
    }
  });
}

