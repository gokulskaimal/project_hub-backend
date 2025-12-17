import { Response } from "express";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { IInviteRepo } from "../../infrastructure/interface/repositories/IInviteRepo";
import { IInviteMemberUseCase } from "../../application/interface/useCases/IInviteMemberUseCase";
import { IOrgRepo } from "../../infrastructure/interface/repositories/IOrgRepo";
export declare class ManagerController {
    private _logger;
    private _userRepo;
    private _inviteRepo;
    private _inviteMemberUC;
    private _orgRepo;
    constructor(_logger: ILogger, _userRepo: IUserRepo, _inviteRepo: IInviteRepo, _inviteMemberUC: IInviteMemberUseCase, _orgRepo: IOrgRepo);
    private sendSuccess;
    inviteMember: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    bulkInvite: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    listInvitations: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    cancelInvitation: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    listMembers: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    updateMemberStatus: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    removeMember: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getOrganization: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=ManagerController.d.ts.map