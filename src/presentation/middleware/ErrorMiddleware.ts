import { NextFunction, Request, Response } from "express";
import logger from "../../infrastructure/services/Logger";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../../infrastructure/config/common.constants";
import { AppError } from "../../domain/errors/AppError";
import {
  EntityNotFoundError,
  ValidationError,
  ConflictError,
  QuotaExceededError,
  TooManyRequestsError,
} from "../../domain/errors/CommonErrors";
import {
  InvalidCredentialsError,
  AccountSuspendedError,
  EmailNotVerifiedError,
  OrganizationNotFoundError,
  OrganizationSuspendedError,
  TokenExpiredError,
  InvalidTokenError,
} from "../../domain/errors/AuthErrors";

export interface HttpError extends Error {
  status?: number;
  code?: string;
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: COMMON_MESSAGES.NOT_FOUND,
    },
  });
}

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };

export function errorHandler(
  err: Error | HttpError | AppError,
  req: Request,
  res: Response,
  _next: NextFunction, // eslint-disable-line @typescript-eslint/no-unused-vars
): void {
  // 1. Default fallback
  let status = StatusCodes.INTERNAL_SERVER_ERROR;
  let message: string = COMMON_MESSAGES.SERVER_ERROR;
  let code = "INTERNAL_ERROR";

  // 2. Map Domain Errors to HTTP Statuses (Robust String-based detection)
  const errCode = (err as AppError).code || "";
  const errName = err.constructor.name;
  const isValidationError =
    err instanceof ValidationError ||
    errCode === "VALIDATION_ERROR" ||
    errName === "ValidationError" ||
    err.message.includes("Organization Name Required");

  if (
    err instanceof AppError ||
    errCode.startsWith("AUTH_") ||
    errCode.startsWith("COMMON_") ||
    errCode === "QUOTA_EXCEEDED" ||
    errCode === "TOO_MANY_REQUESTS" ||
    isValidationError ||
    errCode === "ENTITY_NOT_FOUND" ||
    errCode === "CONFLICT_ERROR" ||
    errName.includes("Error") // Catch-all for our custom Error classes
  ) {
    code =
      errCode || (isValidationError ? "VALIDATION_ERROR" : "INTERNAL_ERROR");
    message = err.message;

    if (
      err instanceof EntityNotFoundError ||
      errCode === "ENTITY_NOT_FOUND" ||
      errName === "EntityNotFoundError"
    ) {
      status = StatusCodes.NOT_FOUND;
    } else if (isValidationError) {
      status = StatusCodes.BAD_REQUEST;
    } else if (
      err instanceof ConflictError ||
      errCode === "CONFLICT_ERROR" ||
      errName === "ConflictError"
    ) {
      status = StatusCodes.CONFLICT;
    } else if (
      err instanceof QuotaExceededError ||
      errCode === "QUOTA_EXCEEDED" ||
      errName === "QuotaExceededError"
    ) {
      status = StatusCodes.FORBIDDEN;
    } else if (
      err instanceof TooManyRequestsError ||
      errCode === "TOO_MANY_REQUESTS" ||
      errName === "TooManyRequestsError"
    ) {
      status = StatusCodes.TOO_MANY_REQUESTS;
    } else if (
      err instanceof InvalidCredentialsError ||
      err instanceof InvalidTokenError ||
      err instanceof TokenExpiredError ||
      errCode.startsWith("AUTH_")
    ) {
      status = StatusCodes.UNAUTHORIZED;
    } else if (
      err instanceof AccountSuspendedError ||
      err instanceof EmailNotVerifiedError ||
      err instanceof OrganizationSuspendedError ||
      err instanceof OrganizationNotFoundError ||
      errName.includes("Suspended")
    ) {
      status = StatusCodes.FORBIDDEN;
    } else {
      status = StatusCodes.BAD_REQUEST; // Default for other recognized domain errors
    }
  }
  // 3. Handle Legacy HttpErrors (Transition period support)
  else if ("status" in err && typeof err.status === "number") {
    status = err.status;
    message = err.message || COMMON_MESSAGES.SERVER_ERROR;
    code = (err as HttpError).code || "HTTP_ERROR";
  }
  // 4. Handle Standard Errors
  else if (err instanceof Error) {
    message = err.message;
  }

  // 5. Log Error
  const traceId = req.headers["x-trace-id"] || `req-${Date.now()}`;
  const userId = (req as { user?: { id?: string } }).user?.id;

  if (status >= 500) {
    logger.error("Server Error", err, {
      path: req.path,
      status,
      message,
      code,
      stack: err.stack,
      context: "ErrorMiddleware",
      traceId,
      userId,
    });
  } else {
    logger.warn("Request Failed", {
      path: req.path,
      status,
      message,
      code,
      context: "ErrorMiddleware",
      traceId,
      userId,
    });
  }

  // 6. Send Strict JSON Response
  res.status(status).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}
