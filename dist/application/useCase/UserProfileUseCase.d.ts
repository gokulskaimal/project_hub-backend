import { IUserProfileUseCase } from "../../domain/interfaces/useCases/IUserProfileUseCase";
import { IUserRepo } from "../../domain/interfaces/IUserRepo";
import { IHashService } from "../../domain/interfaces/services/IHashService";
import { ILogger } from "../../domain/interfaces/services/ILogger";
export declare class UserProfileUseCase implements IUserProfileUseCase {
    private readonly _userRepo;
    private readonly _hashService;
    private readonly _logger;
    constructor(userRepo: IUserRepo, hashService: IHashService, logger: ILogger);
    getProfile(userId: string): Promise<Record<string, unknown>>;
    updateProfile(userId: string, updateData: Record<string, unknown>): Promise<Record<string, unknown>>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    deleteAccount(userId: string, password: string): Promise<void>;
    getActivityHistory(userId: string, limit?: number, offset?: number): Promise<Record<string, unknown>[]>;
    private _validatePassword;
}
//# sourceMappingURL=UserProfileUseCase.d.ts.map