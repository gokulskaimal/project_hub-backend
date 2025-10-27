/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IAuthUseCases } from "../../domain/interfaces/useCases/IAuthUseCases";
import { IRegisterManagerUseCase } from "../../domain/interfaces/useCases/IRegisterManagerUseCase";
import { ISendOtpUseCase } from "../../domain/interfaces/useCases/ISendOtpUseCase";
import { IVerifyOtpUseCase } from "../../domain/interfaces/useCases/IVerifyOtpUseCase";
import { ICompleteSignupUseCase } from "../../domain/interfaces/useCases/ICompleteSignupUseCase";
import { IAcceptUseCase } from "../../domain/interfaces/useCases/IAcceptUseCase";
import { IInviteMemberUseCase } from "../../domain/interfaces/useCases/IInviteMemberUseCase";
import { ILogger } from "../../domain/interfaces/services/ILogger";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../../infrastructure/config/common.constants";
import {
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  completeSignupSchema,
  registerSchema,
} from "../validation/authSchemas";

/**
 * Authentication Controller
 *
 * Handles all authentication-related HTTP requests including login, registration,
 * token refresh, OTP verification, and invitation management.
 * Implements the presentation layer of the application architecture.
 */
@injectable()
export class AuthController {
  /**
   * Creates a new AuthController instance with dependency injection
   *
   * @param authUseCases - Core authentication use cases
   * @param registerManagerUseCase - Manager registration use case
   * @param sendOtpUseCase - OTP sending use case
   * @param verifyOtpUseCase - OTP verification use case
   * @param completeSignupUseCase - Signup completion use case
   * @param acceptUseCase - Invitation acceptance use case
   * @param inviteMemberUseCase - Member invitation use case
   * @param logger - Logging service
   */
  constructor(
    @inject(TYPES.IAuthUseCases) private authUseCases: IAuthUseCases,
    @inject(TYPES.IRegisterManagerUseCase)
    private registerManagerUseCase: IRegisterManagerUseCase,
    @inject(TYPES.ISendOtpUseCase) private sendOtpUseCase: ISendOtpUseCase,
    @inject(TYPES.IVerifyOtpUseCase)
    private verifyOtpUseCase: IVerifyOtpUseCase,
    @inject(TYPES.ICompleteSignupUseCase)
    private completeSignupUseCase: ICompleteSignupUseCase,
    @inject(TYPES.IAcceptUseCase) private acceptUseCase: IAcceptUseCase,
    @inject(TYPES.IInviteMemberUseCase)
    private inviteMemberUseCase: IInviteMemberUseCase,
    @inject(TYPES.ILogger) private logger: ILogger,
  ) {}

  /**
   * Authenticates a user with email and password
   * Sets a refresh token cookie and returns user data with access token
   *
   * @param req - Express request object containing email and password
   * @param res - Express response object
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({
            success: false,
            message:
              parsed.error.errors[0]?.message || COMMON_MESSAGES.INVALID_INPUT,
          });
        return;
      }

      const { email, password } = parsed.data;

      if (!email || !password) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: COMMON_MESSAGES.INVALID_INPUT,
        });
        return;
      }

      const result = await this.authUseCases.login(email, password);

      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(StatusCodes.OK).json({
        success: true,
        message: COMMON_MESSAGES.LOGIN_SUCCESS,
        data: {
          user: result.user,
          role: result.user.role,
          accessToken: result.tokens.accessToken,
          expiresIn: result.tokens.expiresIn,
        },
      });
    } catch (error) {
      this.logger.error("Login failed", error as Error);
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message:
          (error as Error).message || COMMON_MESSAGES.INVALID_CREDENTIALS,
      });
    }
  }

  /**
   * Refreshes an authentication token using a refresh token
   * Accepts refresh token from cookies or request body
   *
   * @param req - Express request object containing refresh token
   * @param res - Express response object
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: COMMON_MESSAGES.INVALID_TOKEN,
        });
        return;
      }

      const result = await this.authUseCases.refreshToken(refreshToken);

      res.status(StatusCodes.OK).json({
        success: true,
        message: COMMON_MESSAGES.TOKEN_REFRESHED,
        data: result,
      });
    } catch (error) {
      this.logger.error("Token refresh failed", error as Error);
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: COMMON_MESSAGES.INVALID_TOKEN,
      });
    }
  }

  /**
   * Registers a new organization manager
   * Initial step in the organization creation process
   *
   * @param req - Express request object containing email and organization name
   * @param res - Express response object
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({
            success: false,
            message:
              parsed.error.errors[0]?.message || COMMON_MESSAGES.INVALID_INPUT,
          });
        return;
      }

      const { email, organizationName } = parsed.data;

      if (!email || !organizationName) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: COMMON_MESSAGES.INVALID_INPUT,
        });
        return;
      }

      const result = await this.registerManagerUseCase.execute(
        email,
        organizationName,
      );

      res.status(StatusCodes.CREATED).json({
        success: true,
        message: COMMON_MESSAGES.CREATED,
        data: result,
      });
    } catch (error) {
      this.logger.error("Manager registration failed", error as Error);
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: (error as Error).message || COMMON_MESSAGES.INVALID_INPUT,
      });
    }
  }

  /**
   * Registers a new organization manager (alias for register method)
   * Provided for API compatibility
   *
   * @param req - Express request object containing registration data
   * @param res - Express response object
   */
  async registerManager(req: Request, res: Response): Promise<void> {
    return this.register(req, res);
  }

  /**
   * Initiates a password reset request
   *
   * @param req - Express request object containing email
   * @param res - Express response object
   */
  async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: COMMON_MESSAGES.INVALID_INPUT,
        });
        return;
      }

      const result = await this.authUseCases.resetPasswordReq(email);

      res.status(StatusCodes.OK).json({
        success: true,
        message: COMMON_MESSAGES.RESET_SENT,
        data: result,
      });
    } catch (error) {
      this.logger.error("Password reset request failed", error as Error);
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: (error as Error).message || COMMON_MESSAGES.INVALID_INPUT,
      });
    }
  }

  /**
   * Initiates a password reset request (alias for requestPasswordReset method)
   * Provided for API compatibility
   *
   * @param req - Express request object containing email
   * @param res - Express response object
   */
  async resetPasswordReq(req: Request, res: Response): Promise<void> {
    return this.requestPasswordReset(req, res);
  }

  /**
   * Completes the password reset process
   *
   * @param req - Express request object containing token and new password
   * @param res - Express response object
   */
  async completeReset(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: COMMON_MESSAGES.INVALID_INPUT,
        });
        return;
      }

      await this.authUseCases.resetPassword(token, password);

      res.status(StatusCodes.OK).json({
        success: true,
        message: COMMON_MESSAGES.RESET_SUCCESS,
      });
    } catch (error) {
      this.logger.error("Password reset completion failed", error as Error);
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: (error as Error).message || COMMON_MESSAGES.INVALID_INPUT,
      });
    }
  }

  /**
   * Completes the password reset process (alias for completeReset method)
   * Provided for API compatibility
   *
   * @param req - Express request object containing token and new password
   * @param res - Express response object
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    return this.completeReset(req, res);
  }

  /**
   * Verifies a user's email address using a verification token
   *
   * @param req - Express request object containing verification token
   * @param res - Express response object
   */
  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: COMMON_MESSAGES.INVALID_INPUT,
        });
        return;
      }

      const result = await this.authUseCases.verifyEmail(token);

      res.status(StatusCodes.OK).json({
        success: true,
        message: COMMON_MESSAGES.EMAIL_VERIFIED,
        data: { verified: result.verified },
      });
    } catch (error) {
      this.logger.error("Email verification failed", error as Error);
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: (error as Error).message || COMMON_MESSAGES.INVALID_INPUT,
      });
    }
  }

  async sendOtp(req: Request, res: Response): Promise<void> {
    try {
      const parsed = sendOtpSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({
            success: false,
            message: parsed.error.errors[0]?.message || "Email is required",
          });
        return;
      }

      const { email } = parsed.data;

      if (!email) {
        res.status(400).json({
          success: false,
          message: "Email is required",
        });
        return;
      }

      const result = await this.sendOtpUseCase.execute(email);

      res.status(StatusCodes.OK).json({
        success: true,
        message: COMMON_MESSAGES.OTP_SENT,
        data: {
          expiresAt: result.expiresAt,
          attemptsRemaining: result.attemptsRemaining,
          ...(process.env.NODE_ENV !== "production"
            ? { otp: "Check server logs for OTP" }
            : {}),
        },
      });
    } catch (error) {
      this.logger.error("Send OTP failed", error as Error);
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const parsed = verifyOtpSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({
            success: false,
            message:
              parsed.error.errors[0]?.message || "Email and OTP are required",
          });
        return;
      }

      const { email, otp } = parsed.data;

      if (!email || !otp) {
        res.status(400).json({
          success: false,
          message: "Email and OTP are required",
        });
        return;
      }

      const result = await this.verifyOtpUseCase.execute(email, otp);

      res.status(StatusCodes.OK).json({
        success: true,
        message: COMMON_MESSAGES.OTP_VERIFIED,
        data: {
          valid: result.valid,
          verified: result.verified,
        },
      });
    } catch (error) {
      this.logger.error("OTP verification failed", error as Error);
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  /**
   * Completes the signup process after OTP verification
   *
   * @param req - Express request object containing user details
   * @param res - Express response object
   */
  async completeSignup(req: Request, res: Response): Promise<void> {
    try {
      const parsed = completeSignupSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({
            success: false,
            message:
              parsed.error.errors[0]?.message || COMMON_MESSAGES.INVALID_INPUT,
          });
        return;
      }

      const { email, password, firstName, lastName, additionalData } =
        parsed.data;

      if (!email || !password || !firstName || !lastName) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: COMMON_MESSAGES.INVALID_INPUT,
        });
        return;
      }

      const result = await this.completeSignupUseCase.execute(
        email,
        password,
        firstName,
        lastName,
        additionalData || {},
      );

      res.status(StatusCodes.CREATED).json({
        success: true,
        message: COMMON_MESSAGES.SIGNUP_COMPLETE,
        data: result,
      });
    } catch (error) {
      this.logger.error("Complete signup failed", error as Error);
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  /**
   * Accepts an invitation to join an organization
   *
   * @param req - Express request object containing token and user details
   * @param res - Express response object
   */
  async acceptInvite(req: Request, res: Response): Promise<void> {
    try {
      const { token, password, firstName, lastName } = req.body;

      if (!token || !password || !firstName || !lastName) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: COMMON_MESSAGES.INVALID_INPUT,
        });
        return;
      }

      const result = await this.acceptUseCase.execute(
        token,
        password,
        firstName,
        lastName,
      );

      res.status(StatusCodes.OK).json({
        success: true,
        message: COMMON_MESSAGES.ACCEPTED,
        data: result,
      });
    } catch (error) {
      this.logger.error("Accept invitation failed", error as Error);
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  /**
   * Invites a new member to join an organization
   *
   * @param req - Express request object containing email, organization ID and role
   * @param res - Express response object
   */
  async inviteMember(req: Request, res: Response): Promise<void> {
    try {
      const { email, orgId, role } = req.body;

      if (!email || !orgId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: COMMON_MESSAGES.INVALID_INPUT,
        });
        return;
      }

      const result = await this.inviteMemberUseCase.execute(email, orgId, role);

      res.status(StatusCodes.CREATED).json({
        success: true,
        message: COMMON_MESSAGES.INVITATION_SENT,
        data: result,
      });
    } catch (error) {
      this.logger.error("Invite member failed", error as Error);
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  /**
   * Validates an invitation token
   *
   * @param req - Express request object containing token
   * @param res - Express response object
   */
  async validateInviteToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      if (!token) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: COMMON_MESSAGES.INVALID_INPUT,
        });
        return;
      }

      // In a real implementation, you would validate the invitation token
      // For now, we'll return a mock response
      res.status(StatusCodes.OK).json({
        success: true,
        message: COMMON_MESSAGES.ACCEPTED,
        data: {
          valid: true,
          organizationName: "Sample Organization",
          inviterEmail: "manager@example.com",
        },
      });
    } catch (error) {
      this.logger.error("Token validation failed", error as Error);
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  /**
   * Logs out a user by invalidating their refresh token
   *
   * @param req - Express request object containing user ID and refresh token
   * @param res - Express response object
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const refreshToken = req.cookies.refreshToken;

      if (userId && refreshToken) {
        await this.authUseCases.logout(userId, refreshToken);
      }

      res.clearCookie("refreshToken");

      res.status(StatusCodes.OK).json({
        success: true,
        message: COMMON_MESSAGES.LOGOUT_SUCCESS,
      });
    } catch (error) {
      this.logger.error("Logout failed", error as Error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: COMMON_MESSAGES.SERVER_ERROR,
      });
    }
  }
}
