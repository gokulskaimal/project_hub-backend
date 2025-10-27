import { IUserRepo } from "../../domain/interfaces/IUserRepo";
import { ICompleteSignupUseCase } from '../../domain/interfaces/useCases/ICompleteSignupUseCase';
import { ILogger } from '../../domain/interfaces/services/ILogger';
import { IHashService } from '../../domain/interfaces/services/IHashService';
import { IJwtService } from '../../domain/interfaces/services/IJwtService';
export declare class CompleteSignupUseCase implements ICompleteSignupUseCase {
    private readonly _userRepo;
    private readonly _logger;
    private readonly _hashService;
    private readonly _jwtService;
    constructor(userRepo: IUserRepo, logger: ILogger, hashService: IHashService, jwtService: IJwtService);
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
    execute(email: string, password: string, firstName: string, lastName: string, additionalData?: Record<string, any>): Promise<{
        user: any;
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
    private _validatePassword;
}
//# sourceMappingURL=CompleteSignupUseCase.d.ts.map