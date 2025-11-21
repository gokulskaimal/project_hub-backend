/* eslint-disable @typescript-eslint/no-unused-vars */

import { injectable, inject } from "inversify";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { TYPES } from "../../infrastructure/container/types";
import { IAuthUseCases } from "../../domain/interfaces/useCases/IAuthUseCases";
import { ILogger } from "../../domain/interfaces/services/ILogger";
import { AuthResult, AuthTokens } from "../../domain/interfaces/useCases/types";
import { UserDTO } from "../../application/dto/UserDTO";
import { IRegisterManagerUseCase } from "../../domain/interfaces/useCases/IRegisterManagerUseCase";
import { ISendOtpUseCase } from "../../domain/interfaces/useCases/ISendOtpUseCase";
import { IVerifyOtpUseCase } from "../../domain/interfaces/useCases/IVerifyOtpUseCase";
import { ICompleteSignupUseCase } from "../../domain/interfaces/useCases/ICompleteSignupUseCase";
import { IInviteMemberUseCase } from "../../domain/interfaces/useCases/IInviteMemberUseCase";
import { IAcceptUseCase } from "../../domain/interfaces/useCases/IAcceptUseCase";
import { IResetPasswordUseCase } from "../../domain/interfaces/useCases/IResetPasswordUseCase";

import { asyncHandler } from "../../utils/asyncHandler";

@injectable()
export class AuthController {
  // Keep cookie options centralized
  private readonly refreshCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  constructor(
    @inject(TYPES.ILogger) private readonly logger: ILogger,
    @inject(TYPES.IAuthUseCases) private readonly authUseCases: IAuthUseCases,
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

  // Schemas
  private registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
  });

  private loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  private registerManagerSchema = z.object({
    email: z.string().email(),
    organizationName: z.string().min(2),
  });

  private sendOtpSchema = z.object({
    email: z.string().email(),
  });

  private verifyOtpSchema = z.object({
    email: z.string().email(),
    otp: z.string().min(4),
  });

  private completeSignupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
  });

  private inviteMemberSchema = z.object({
    email: z.string().email(),
    orgId: z.string().min(1),
    role: z.string().min(1),
  });

  private acceptInviteSchema = z.object({
    token: z.string().min(1),
    password: z.string().min(6),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
  });

  private resetPasswordReqSchema = z.object({
    email: z.string().email(),
  });

  private resetPasswordSchema = z.object({
    token: z.string().min(1),
    password: z.string().min(6),
  });

  private googleSignInSchema = z.object({
    idToken: z.string().min(1),
    inviteToken: z.string().optional(),
    orgName: z.string().optional(),
  });

  // Methods exposed as arrow functions so routing can pass them directly
  register = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const parsed = this.registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: "Invalid input", details: parsed.error.format() });
      }

      const { email, password, name } = parsed.data;
      const created = await this.authUseCases.register(email, password, name);

      // created should be a DTO with public user fields (no password)
      return res.status(201).json({ data: created });
    },
  );

  login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const parsed = this.loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: "Invalid input", details: parsed.error.format() });
      }

      const { email, password } = parsed.data;

      const result: AuthResult = await this.authUseCases.login(email, password);
      const tokens: AuthTokens = result.tokens;
      const user: UserDTO = result.user;
      if (tokens.refreshToken) {
        res.cookie(
          "refreshToken",
          tokens.refreshToken,
          this.refreshCookieOptions,
        );
      }

      // Return access token and user info (no sensitive fields)
      return res.json({ accessToken: tokens.accessToken, user });
    },
  );

  refreshToken = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      // read cookie (ensure cookie-parser middleware is used globally)
      const refreshToken = req.cookies?.refreshToken as string | undefined;
      if (!refreshToken) {
        return res.status(401).json({ error: "Missing refresh token" });
      }

      // Expect the use-case to return { accessToken, refreshToken } (rotated)
      const tokens = await this.authUseCases.refresh(refreshToken);

      // rotate cookie
      if (tokens.refreshToken) {
        res.cookie(
          "refreshToken",
          tokens.refreshToken,
          this.refreshCookieOptions,
        );
      }

      return res.json({ accessToken: tokens.accessToken });
    },
  );

  logout = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const refreshToken = req.cookies?.refreshToken as string | undefined;
      if (refreshToken) {
        // logout use-case should revoke the provided refresh token
        try {
          await this.authUseCases.logout(refreshToken);
        } catch (err) {
          // log and continue to clear cookie; revocation failure shouldn't block logout response
          this.logger?.warn?.(
            "Failed to revoke refresh token during logout",
            err as Error,
          );
        }
      }

      // clear cookie
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return res.json({ ok: true });
    },
  );

  registerManager = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const parsed = this.registerManagerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: "Invalid input", details: parsed.error.format() });
      }

      const { email, organizationName } = parsed.data;
      const result = await this.registerManagerUC.execute(
        email,
        organizationName,
      );
      return res.status(201).json(result);
    },
  );

  sendOtp = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const parsed = this.sendOtpSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: "Invalid input", details: parsed.error.format() });
      }

      const { email } = parsed.data;
      const result = await this.sendOtpUC.execute(email);
      return res.json(result);
    },
  );

  verifyOtp = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const parsed = this.verifyOtpSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: "Invalid input", details: parsed.error.format() });
      }

      const { email, otp } = parsed.data;
      const result = await this.verifyOtpUC.execute(email, otp);
      return res.json(result);
    },
  );

  completeSignup = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const parsed = this.completeSignupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: "Invalid input", details: parsed.error.format() });
      }

      const { email, password, firstName, lastName } = parsed.data;
      const result = await this.completeSignupUC.execute(
        email,
        password,
        firstName,
        lastName,
      );
      return res.json(result);
    },
  );

  inviteMember = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const parsed = this.inviteMemberSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: "Invalid input", details: parsed.error.format() });
      }

      const { email, orgId, role } = parsed.data;
      const result = await this.inviteMemberUC.execute(email, orgId, role);
      return res.status(201).json(result);
    },
  );

  acceptInvite = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const parsed = this.acceptInviteSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: "Invalid input", details: parsed.error.format() });
      }

      const { token, password, firstName, lastName } = parsed.data;
      const result = await this.acceptUC.execute(
        token,
        password,
        firstName,
        lastName,
      );
      return res.json(result);
    },
  );

  validateInviteToken = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { token } = req.params;
      if (!token) return res.status(400).json({ error: "Missing token" });

      const result = await this.acceptUC.validateInvitationToken(token);
      return res.json(result);
    },
  );

  // -----------------------
  // Password reset
  // -----------------------
  resetPasswordReq = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const parsed = this.resetPasswordReqSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: "Invalid input", details: parsed.error.format() });
      }

      const { email } = parsed.data;
      const result = await this.resetPasswordUC.requestReset(email);
      return res.json(result);
    },
  );

  resetPassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const parsed = this.resetPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: "Invalid input", details: parsed.error.format() });
      }

      const { token, password } = parsed.data;
      const result = await this.resetPasswordUC.resetWithToken(token, password);
      return res.json(result);
    },
  );

  // -----------------------
  // Verify email (token may be body or header)
  // -----------------------
  verifyEmail = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const token = req.body?.token ?? req.headers["x-verification-token"];
      if (!token)
        return res.status(400).json({ error: "Missing verification token" });

      const result = await this.authUseCases.verifyEmail(String(token));
      return res.json(result);
    },
  );

  googleSignIn = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      this.logger.info("Google Sign-In attempt initiated");
      try {
        const parsed = this.googleSignInSchema.safeParse(req.body);
        if (!parsed.success) {
          this.logger.warn(
            "Google Sign-In invalid input",
            parsed.error.format(),
          );
          return res
            .status(400)
            .json({ error: "Invalid input", details: parsed.error.format() });
        }

        const { idToken, inviteToken, orgName } = parsed.data;
        const result = await this.authUseCases.googleSignIn(
          idToken,
          inviteToken,
          orgName,
        );

        // Set refresh token cookie if available
        if (result.tokens.refreshToken) {
          res.cookie(
            "refreshToken",
            result.tokens.refreshToken,
            this.refreshCookieOptions,
          );
        }

        this.logger.info("Google Sign-In successful", {
          userId: result.user.id,
        });
        return res.json({
          accessToken: result.tokens.accessToken,
          user: result.user,
          expiresIn: result.tokens.expiresIn,
        });
      } catch (error: unknown) {
        if (
          error instanceof Error &&
          error.message === "Organization Name Required"
        ) {
          return res.status(400).json({ error: "Organization Name Required" });
        }
        this.logger.error(
          "Google Sign-In failed in controller",
          error as Error,
        );
        throw error;
      }
    },
  );
}
