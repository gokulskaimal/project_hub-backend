import { Response } from "express";
import { ILogger } from "../../domain/interfaces/services/ILogger";
import { IUserProfileUseCase } from "../../domain/interfaces/useCases/IUserProfileUseCase";
export declare class UserController {
    private logger;
    private userProfileUseCase;
    constructor(logger: ILogger, userProfileUseCase: IUserProfileUseCase);
    private sendSuccess;
    getProfile: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    updateProfile: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    changePassword: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    deleteAccount: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=UserController.d.ts.map