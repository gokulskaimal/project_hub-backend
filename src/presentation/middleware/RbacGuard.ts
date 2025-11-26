import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../../infrastructure/config/common.constants";
import { AuthenticatedRequest } from "./types/AuthenticatedRequest";

export const requireRoles =
  (...roles: string[]) =>
  (req: Request | AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userReq = req as AuthenticatedRequest;
    const role = userReq.user?.role;

    if (!role || !roles.includes(role as string)) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ error: COMMON_MESSAGES.FORBIDDEN });
    }

    next();
  };
