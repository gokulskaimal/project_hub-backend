import { IInviteRepo } from "../../infrastructure/interface/repositories/IInviteRepo";
import { IEmailService } from "../../infrastructure/interface/services/IEmailService";
import { IInviteMemberUseCase } from "../interface/useCases/IInviteMemberUseCase";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { IOrgRepo } from "../../infrastructure/interface/repositories/IOrgRepo";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
export declare class InviteMemberUseCase implements IInviteMemberUseCase {
    private readonly _inviteRepo;
    private readonly _emailService;
    private readonly _logger;
    private readonly _orgRepo;
    private readonly _userRepo;
    constructor(_inviteRepo: IInviteRepo, _emailService: IEmailService, _logger: ILogger, _orgRepo: IOrgRepo, _userRepo: IUserRepo);
    execute(email: string, orgId: string, role?: string): Promise<{
        invitationId: string;
        token: string;
        expiresAt: Date;
        message: string;
    }>;
    bulkInvite(emails: string[], orgId: string, role?: string): Promise<{
        successful: Array<{
            email: string;
            invitationId: string;
        }>;
        failed: Array<{
            email: string;
            error: string;
        }>;
        summary: {
            total: number;
            successful: number;
            failed: number;
        };
    }>;
    private _validateInput;
    private _generateInvitationToken;
    private _sendInvitationEmail;
}
//# sourceMappingURL=InviteMemberUseCase.d.ts.map