import { Response, NextFunction } from "express";
import { UserRole } from "../../domain/enums/UserRole";
import { AuthenticatedRequest } from "./types/AuthenticatedRequest";
export declare function roleMiddleware(requiredRoles: UserRole | UserRole[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=RoleMiddleware.d.ts.map