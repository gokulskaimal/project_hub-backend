import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "./types/AuthenticatedRequest";
import { AuthenticatedUser } from "./types/AuthenticatedUser";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../../infrastructure/config/common.constants";
import { OrganizationStatus } from "../../domain/entities/Organization";
import { UserRole } from "../../domain/enums/UserRole";
import { container } from "../../infrastructure/container/Container";
import { TYPES } from "../../infrastructure/container/types";
import { AppConfig } from "../../config/AppConfig";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { IOrgRepo } from "../../application/interface/repositories/IOrgRepo";

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      error: {
        code: "AUTH_TOKEN_MISSING",
        message: COMMON_MESSAGES.UNAUTHORIZED,
      },
    });
    return;
  }

  try {
    const config = container.get<AppConfig>(TYPES.AppConfig);
    const payload = jwt.verify(
      token,
      config.jwt.accessSecret,
    ) as AuthenticatedUser;

    // Allow super-admin tokens to bypass DB checks
    if (payload.role !== UserRole.SUPER_ADMIN) {
      const userRepo = container.get<IUserRepo>(TYPES.IUserRepo);
      const orgRepo = container.get<IOrgRepo>(TYPES.IOrgRepo);

      // Uses repository layer — respects isDeleted: { $ne: true } guard
      const user = await userRepo.findById(payload.id);
      if (!user) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          error: {
            code: "AUTH_USER_NOT_FOUND",
            message: COMMON_MESSAGES.UNAUTHORIZED,
          },
        });
        return;
      }

      if (user.status !== "ACTIVE") {
        res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          error: {
            code: "AUTH_ACCOUNT_SUSPENDED",
            message: "User account suspended or disabled",
          },
        });
        return;
      }

      if (user.orgId) {
        const org = await orgRepo.findById(user.orgId);
        if (!org) {
          res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            error: {
              code: "AUTH_ORG_NOT_FOUND",
              message: "Organization not found",
            },
          });
          return;
        }
        if (org.status !== OrganizationStatus.ACTIVE) {
          res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            error: {
              code: "AUTH_ORG_SUSPENDED",
              message: "Organization suspended or disabled",
            },
          });
          return;
        }
      }
    }

    req.user = payload;
    next();
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: {
          code: "TOKEN_EXPIRED",
          message: "JWT token expired",
        },
      });
      return;
    }

    const message =
      error instanceof Error ? error.message : COMMON_MESSAGES.UNAUTHORIZED;
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      error: {
        code: "AUTH_INVALID_TOKEN",
        message,
      },
    });
  }
}
