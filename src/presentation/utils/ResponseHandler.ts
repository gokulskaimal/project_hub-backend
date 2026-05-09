import { Response } from "express";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
import { ApiResponse } from "./ApiResponse";

export class ResponseHandler {
  static success<T>(
    res: Response,
    data: T,
    message: string = "Success",
    status: number = StatusCodes.OK,
    pagination?: ApiResponse<T>["pagination"],
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      ...(pagination && { pagination }),
    };
    res.status(status).json(response);
  }

  static created<T>(res: Response, data: T, message: string = "Created"): void {
    this.success(res, data, message, StatusCodes.CREATED);
  }

  static error(
    res: Response,
    message: string = "Internal server Error",
    status: number = StatusCodes.INTERNAL_SERVER_ERROR,
    errors: unknown = null,
  ): void {
    const response: ApiResponse = {
      success: false,
      message,
      error: {
        code: status.toString(),
        message,
        details: errors,
      },
      timestamp: new Date().toISOString(),
    };
    res.status(status).json(response);
  }

  static validationError(
    res: Response,
    errors: unknown,
    message: string = "Validation Error",
  ): void {
    this.error(res, message, StatusCodes.BAD_REQUEST, errors);
  }

  static unauthorized(res: Response, message: string = "Unauthorized"): void {
    this.error(res, message, StatusCodes.UNAUTHORIZED);
  }

  static forbidden(res: Response, message: string = " Access Forbidden"): void {
    this.error(res, message, StatusCodes.FORBIDDEN);
  }

  static notFound(res: Response, message: string = "Not Found"): void {
    this.error(res, message, StatusCodes.NOT_FOUND);
  }

  static conflict(res: Response, message: string = "Conflict"): void {
    this.error(res, message, StatusCodes.CONFLICT);
  }

  static tooManyRequests(
    res: Response,
    message: string = "Too Many Requests",
  ): void {
    this.error(res, message, StatusCodes.TOO_MANY_REQUESTS);
  }

  static serverError(
    res: Response,
    message: string = "Internal Server Error",
  ): void {
    this.error(res, message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}
