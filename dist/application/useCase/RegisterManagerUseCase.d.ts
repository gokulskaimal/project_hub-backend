import { IUserRepo } from "../../domain/interfaces/IUserRepo";
import { IOtpService } from "../../domain/interfaces/services/IOtpService";
import { IEmailService } from "../../domain/interfaces/services/IEmailService";
import { IRegisterManagerUseCase } from "../../domain/interfaces/useCases/IRegisterManagerUseCase";
import { ILogger } from "../../domain/interfaces/services/ILogger";
import { IOrgRepo } from "../../domain/interfaces/IOrgRepo";
export declare class RegisterManagerUseCase implements IRegisterManagerUseCase {
    private readonly _userRepo;
    private readonly _otpService;
    private readonly _emailService;
    private readonly _logger;
    private readonly _orgRepo;
    constructor(userRepo: IUserRepo, otpService: IOtpService, emailService: IEmailService, logger: ILogger, orgRepo: IOrgRepo);
    execute(email: string, organizationName: string): Promise<{
        message: string;
        organizationId: string;
        invitationToken: string;
        otpExpiresAt: Date;
    }>;
    validateOrganizationName(name: string): Promise<boolean>;
    private _validateInput;
    private _generateInvitationToken;
}
//# sourceMappingURL=RegisterManagerUseCase.d.ts.map