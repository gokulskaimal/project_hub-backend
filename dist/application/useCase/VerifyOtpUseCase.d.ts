import { IVerifyOtpUseCase } from "../interface/useCases/IVerifyOtpUseCase";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { ICacheService } from "../../infrastructure/interface/services/ICacheService";
export declare class VerifyOtpUseCase implements IVerifyOtpUseCase {
    private readonly _userRepo;
    private readonly _logger;
    private readonly _cache;
    constructor(_userRepo: IUserRepo, _logger: ILogger, _cache: ICacheService);
    execute(email: string, otp: string): Promise<{
        valid: boolean;
        message: string;
        verified: boolean;
    }>;
    getAttemptsRemaining(email: string): Promise<number>;
}
//# sourceMappingURL=VerifyOtpUseCase.d.ts.map