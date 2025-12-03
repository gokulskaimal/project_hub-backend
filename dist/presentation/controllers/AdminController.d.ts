import { Request, Response } from "express";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { IOrgRepo } from "../../infrastructure/interface/repositories/IOrgRepo";
import { IInviteMemberUseCase } from "../../application/interface/useCases/IInviteMemberUseCase";
import { IOrganizationManagementUseCase } from "../../application/interface/useCases/IOrganizationManagementUseCase";
import { CreatePlanUseCase } from "../../application/useCase/CreatePlanUseCase";
import { GetPlansUseCase } from "../../application/useCase/GetPlansUseCase";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
export declare class AdminController {
    private _userRepo;
    private _orgRepo;
    private _inviteMemberUseCase;
    private _orgManagementUseCase;
    private _createPlanUseCase;
    private _getPlanUseCase;
    private logger;
    constructor(_userRepo: IUserRepo, _orgRepo: IOrgRepo, _inviteMemberUseCase: IInviteMemberUseCase, _orgManagementUseCase: IOrganizationManagementUseCase, _createPlanUseCase: CreatePlanUseCase, _getPlanUseCase: GetPlansUseCase, logger: ILogger);
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
    createPlan: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getPlans: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=AdminController.d.ts.map