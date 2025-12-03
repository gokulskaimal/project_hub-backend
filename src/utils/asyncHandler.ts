import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../infrastructure/config/common.constants";
import logger from "../infrastructure/services/Logger";

// 1. Custom Error Class
export class HttpError extends Error {
  status: number;
  details: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

// 2. Async Handler Wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 3. 404 Not Found Handler
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    error: COMMON_MESSAGES.NOT_FOUND || "Resource not found",
  });
}

// 4. Global Error Handler
export function errorHandler(
  err: HttpError | Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  const status =
    err instanceof HttpError ? err.status : StatusCodes.INTERNAL_SERVER_ERROR;
  const message =
    status === StatusCodes.INTERNAL_SERVER_ERROR
      ? COMMON_MESSAGES.SERVER_ERROR || "Internal Server Error"
      : err.message;

  if (status >= 400 && status < 500) {
    logger.warn("Request validation failed", {
      path: req.path,
      method: req.method,
      status,
      message,
      ip: req.ip,
    });
  } else {
    logger.error("Request failed", err as Error, {
      path: req.path,
      method: req.method,
      status,
      ip: req.ip,
    });
  }

  res.status(status).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    // In production, do not send stack traces
    ...(process.env.NODE_ENV === "development" &&
      status >= 500 && { stack: err.stack }),
  });
}
