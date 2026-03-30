import { Response, NextFunction } from "express";
import { UserRole } from "../../domain/enums/UserRole";
import { AuthenticatedRequest } from "./types/AuthenticatedRequest";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../../infrastructure/config/common.constants";

export function roleMiddleware(requiredRoles: UserRole | UserRole[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    const currentUser = req.user;
    if (!currentUser) {
      res
        .status(StatusCodes.FORBIDDEN)
        .json({ error: COMMON_MESSAGES.FORBIDDEN });
      return;
    }

    const allowedRoles = Array.isArray(requiredRoles)
      ? requiredRoles
      : [requiredRoles];
    if (!allowedRoles.includes(currentUser.role)) {
      res
        .status(StatusCodes.FORBIDDEN)
        .json({ error: COMMON_MESSAGES.FORBIDDEN });
      return;
    }

    next();
  };
}
