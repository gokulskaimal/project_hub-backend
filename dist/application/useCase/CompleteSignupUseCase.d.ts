import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { ICompleteSignupUseCase } from "../interface/useCases/ICompleteSignupUseCase";
import { IHashService } from "../../infrastructure/interface/services/IHashService";
import { IJwtService } from "../../infrastructure/interface/services/IJwtService";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { User } from "../../domain/entities/User";
export declare class CompleteSignupUseCase implements ICompleteSignupUseCase {
    private readonly _userRepo;
    private readonly _logger;
    private readonly _hashService;
    private readonly _jwtService;
    constructor(_userRepo: IUserRepo, _logger: ILogger, _hashService: IHashService, _jwtService: IJwtService);
    validateSignupData(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }): Promise<boolean>;
    /**
     * Complete user signup process
     * @param email - User email
     * @param name - User full name
     * @param password - User password
     * @returns Updated user data
     */
    execute(email: string, password: string, firstName: string, lastName: string, additionalData?: Record<string, unknown>): Promise<{
        user: Partial<User>;
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
    private _validatePassword;
}
//# sourceMappingURL=CompleteSignupUseCase.d.ts.map