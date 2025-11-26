/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import logger from "../../infrastructure/services/Logger";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../../infrastructure/config/common.constants";

export interface HttpError extends Error {
  status?: number;
  code?: string;
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(StatusCodes.NOT_FOUND).json({ error: COMMON_MESSAGES.NOT_FOUND });
}

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export function errorHandler(
  err: HttpError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const status = err.status ?? StatusCodes.INTERNAL_SERVER_ERROR;
  const message =
    status === StatusCodes.INTERNAL_SERVER_ERROR
      ? COMMON_MESSAGES.SERVER_ERROR
      : err.message;

  if (status >= 400 && status < 500) {
    logger.warn("Request validation failed", {
      path: req.path,
      status,
      message,
    });
  } else {
    logger.error("Request failed", err, {
      path: req.path,
      status,
      message,
      stack: err.stack,
    });
  }

  res.status(status).json({ error: message, code: err.code });
}
