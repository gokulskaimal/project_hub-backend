import { Response } from "express";
import { ILogger } from "../../domain/interfaces/services/ILogger";
import { IUserRepo } from "../../domain/interfaces/IUserRepo";
import { IInviteRepo } from "../../domain/interfaces/IInviteRepo";
import { IInviteMemberUseCase } from "../../domain/interfaces/useCases/IInviteMemberUseCase";
export declare class ManagerController {
    private _logger;
    private _userRepo;
    private _inviteRepo;
    private _inviteMemberUC;
    constructor(_logger: ILogger, _userRepo: IUserRepo, _inviteRepo: IInviteRepo, _inviteMemberUC: IInviteMemberUseCase);
    private sendSuccess;
    inviteMember: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    bulkInvite: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    listInvitations: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    cancelInvitation: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    listMembers: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    updateMemberStatus: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    removeMember: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=ManagerController.d.ts.map