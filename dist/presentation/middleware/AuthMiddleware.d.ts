import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./types/AuthenticatedRequest";
export declare function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=AuthMiddleware.d.ts.map