import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "./types/AuthenticatedRequest";
import { AuthenticatedUser } from "./types/AuthenticatedUser";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../../infrastructure/config/common.constants";
import UserModel from "../../infrastructure/models/UserModel";
import OrgModel from "../../infrastructure/models/OrgModel";
import { OrganizationStatus } from "../../domain/entities/Organization";
import { UserRole } from "../../domain/enums/UserRole";
import { container } from "../../infrastructure/container/Container";
import { TYPES } from "../../infrastructure/container/types";
import { AppConfig } from "../../config/AppConfig";

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

    // Allow super-admin tokens (synthetic user) to bypass DB checks
    if (payload.role !== UserRole.SUPER_ADMIN) {
      // Fetch latest user state from DB to ensure status/org checks
      const userDoc = await UserModel.findById(payload.id);
      if (!userDoc) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          error: {
            code: "AUTH_USER_NOT_FOUND",
            message: COMMON_MESSAGES.UNAUTHORIZED,
          },
        });
        return;
      }

      // If user is not ACTIVE, deny access
      if (userDoc.status !== "ACTIVE") {
        res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          error: {
            code: "AUTH_ACCOUNT_SUSPENDED",
            message: "User account suspended or disabled",
          },
        });
        return;
      }

      // If user's organization exists and is not ACTIVE, deny access
      if (userDoc.orgId) {
        const orgDoc = await OrgModel.findById(userDoc.orgId);
        if (!orgDoc) {
          res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            error: {
              code: "AUTH_ORG_NOT_FOUND",
              message: "Organization not found",
            },
          });
          return;
        }
        if (orgDoc.status !== OrganizationStatus.ACTIVE) {
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
    // Check if the error is a JWT expiration error
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
