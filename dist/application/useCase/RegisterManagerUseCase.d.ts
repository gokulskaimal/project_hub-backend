import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { IOtpService } from "../../infrastructure/interface/services/IOtpService";
import { IEmailService } from "../../infrastructure/interface/services/IEmailService";
import { IRegisterManagerUseCase } from "../interface/useCases/IRegisterManagerUseCase";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { IOrgRepo } from "../../infrastructure/interface/repositories/IOrgRepo";
export declare class RegisterManagerUseCase implements IRegisterManagerUseCase {
    private readonly _userRepo;
    private readonly _otpService;
    private readonly _emailService;
    private readonly _logger;
    private readonly _orgRepo;
    constructor(_userRepo: IUserRepo, _otpService: IOtpService, _emailService: IEmailService, _logger: ILogger, _orgRepo: IOrgRepo);
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