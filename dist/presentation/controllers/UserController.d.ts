import { Response } from "express";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { IUserProfileUseCase } from "../../application/interface/useCases/IUserProfileUseCase";
export declare class UserController {
    private _logger;
    private userProfileUseCase;
    constructor(_logger: ILogger, userProfileUseCase: IUserProfileUseCase);
    private sendSuccess;
    getProfile: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    updateProfile: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    changePassword: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    deleteAccount: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=UserController.d.ts.map