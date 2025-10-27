import { NextFunction, Request, Response } from 'express';
export interface HttpError extends Error {
    status?: number;
    code?: string;
}
export declare function notFoundHandler(req: Request, res: Response): void;
export declare function errorHandler(err: HttpError, req: Request, res: Response, _next: NextFunction): void;
//# sourceMappingURL=ErrorMiddleware.d.ts.map