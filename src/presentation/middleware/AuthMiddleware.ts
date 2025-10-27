import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "./types/AuthenticatedRequest";
import { AuthenticatedUser } from "./types/AuthenticatedUser";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../../infrastructure/config/common.constants";

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ error: COMMON_MESSAGES.UNAUTHORIZED });
    return;
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET!,
    ) as AuthenticatedUser;
    req.user = payload;
    next();
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : COMMON_MESSAGES.UNAUTHORIZED;
    res.status(StatusCodes.UNAUTHORIZED).json({ error: message });
  }
}
