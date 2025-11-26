import { Request, Response } from "express";
import { IUserRepo } from "../../domain/interfaces/IUserRepo";
import { IOrgRepo } from "../../domain/interfaces/IOrgRepo";
import { IInviteMemberUseCase } from "../../domain/interfaces/useCases/IInviteMemberUseCase";
import { IOrganizationManagementUseCase } from "../../domain/interfaces/useCases/IOrganizationManagementUseCase";
import { ILogger } from "../../domain/interfaces/services/ILogger";
export declare class AdminController {
    private userRepo;
    private orgRepo;
    private inviteMemberUseCase;
    private orgManagementUseCase;
    private logger;
    constructor(userRepo: IUserRepo, orgRepo: IOrgRepo, inviteMemberUseCase: IInviteMemberUseCase, orgManagementUseCase: IOrganizationManagementUseCase, logger: ILogger);
    private sendSuccess;
    listOrganizations: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createOrganization: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getOrganizationById: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateOrganization: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteOrganization: (req: Request, res: Response, next: import("express").NextFunction) => void;
    listUsers: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getUserById: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateUserStatus: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getReports: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getDashboardStats: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getUsersByOrganization: (req: Request, res: Response, next: import("express").NextFunction) => void;
    inviteMember: (req: Request, res: Response, next: import("express").NextFunction) => void;
    bulkInviteMembers: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=AdminController.d.ts.map