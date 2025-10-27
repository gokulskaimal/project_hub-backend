/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../../infrastructure/config/common.constants";

export const requireRoles =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const role = (req as any).user?.role;
    if (!role || !roles.includes(role)) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ error: COMMON_MESSAGES.FORBIDDEN });
    }
    next();
  };
