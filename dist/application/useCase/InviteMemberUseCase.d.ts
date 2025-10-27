import { IInviteRepo } from "../../domain/interfaces/IInviteRepo";
import { IEmailService } from "../../domain/interfaces/services/IEmailService ";
import { IInviteMemberUseCase } from '../../domain/interfaces/useCases/IInviteMemberUseCase ';
import { ILogger } from '../../domain/interfaces/services/ILogger';
import { IOrgRepo } from '../../domain/interfaces/IOrgRepo';
import { IUserRepo } from '../../domain/interfaces/IUserRepo';
export declare class InviteMemberUseCase implements IInviteMemberUseCase {
    private readonly _inviteRepo;
    private readonly _emailService;
    private readonly _logger;
    private readonly _orgRepo;
    private readonly _userRepo;
    constructor(inviteRepo: IInviteRepo, emailService: IEmailService, logger: ILogger, orgRepo: IOrgRepo, userRepo: IUserRepo);
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