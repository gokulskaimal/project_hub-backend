import { IVerifyOtpUseCase } from "../../domain/interfaces/useCases/IVerifyOtpUseCase";
import { IUserRepo } from "../../domain/interfaces/IUserRepo";
import { ILogger } from "../../domain/interfaces/services/ILogger";
import { ICacheService } from "../../domain/interfaces/services/ICacheService";
export declare class VerifyOtpUseCase implements IVerifyOtpUseCase {
    private readonly _userRepo;
    private readonly _logger;
    private readonly _cache;
    constructor(userRepo: IUserRepo, logger: ILogger, cache: ICacheService);
    execute(email: string, otp: string): Promise<{
        valid: boolean;
        message: string;
        verified: boolean;
    }>;
    getAttemptsRemaining(email: string): Promise<number>;
}
//# sourceMappingURL=VerifyOtpUseCase.d.ts.map