import { IUserProfileUseCase } from "../interface/useCases/IUserProfileUseCase";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { IHashService } from "../../infrastructure/interface/services/IHashService";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
export declare class UserProfileUseCase implements IUserProfileUseCase {
    private readonly _userRepo;
    private readonly _hashService;
    private readonly _logger;
    constructor(_userRepo: IUserRepo, _hashService: IHashService, _logger: ILogger);
    getProfile(userId: string): Promise<Record<string, unknown>>;
    updateProfile(userId: string, updateData: Record<string, unknown>): Promise<Record<string, unknown>>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    deleteAccount(userId: string, password: string): Promise<void>;
    getActivityHistory(userId: string, limit?: number, offset?: number): Promise<Record<string, unknown>[]>;
    private _validatePassword;
}
//# sourceMappingURL=UserProfileUseCase.d.ts.map