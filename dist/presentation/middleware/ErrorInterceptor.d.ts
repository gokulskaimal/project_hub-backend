import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../../domain/enums/HttpStatus';
export declare class ApiError extends Error {
    statusCode: HttpStatus;
    details?: unknown | undefined;
    constructor(statusCode: HttpStatus, message: string, details?: unknown | undefined);
}
export declare const errorInterceptor: (err: Error, req: Request, res: Response, _next: NextFunction) => Response<any, Record<string, any>>;
//# sourceMappingURL=ErrorInterceptor.d.ts.map