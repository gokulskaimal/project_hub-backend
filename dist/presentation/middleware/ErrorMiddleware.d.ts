import { NextFunction, Request, Response } from "express";
import { AppError } from "../../domain/errors/AppError";
export interface HttpError extends Error {
    status?: number;
    code?: string;
}
export declare function notFoundHandler(_req: Request, res: Response): void;
export declare const asyncHandler: (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) => Promise<unknown>;
export declare function errorHandler(err: Error | HttpError | AppError, req: Request, res: Response, _next: NextFunction): void;
//# sourceMappingURL=ErrorMiddleware.d.ts.map