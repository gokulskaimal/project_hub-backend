import { IUserProfileUseCase } from "../interface/useCases/IUserProfileUseCase";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { IOrgRepo } from "../../infrastructure/interface/repositories/IOrgRepo";
import { IHashService } from "../../infrastructure/interface/services/IHashService";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { UserDTO, UpdateProfileRequestDTO } from "../../application/dto/UserDTO";
export declare class UserProfileUseCase implements IUserProfileUseCase {
    private readonly _userRepo;
    private readonly _orgRepo;
    private readonly _hashService;
    private readonly _logger;
    constructor(_userRepo: IUserRepo, _orgRepo: IOrgRepo, _hashService: IHashService, _logger: ILogger);
    getProfile(userId: string): Promise<UserDTO>;
    updateProfile(userId: string, updateData: UpdateProfileRequestDTO): Promise<UserDTO>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    deleteAccount(userId: string, password: string): Promise<void>;
    getActivityHistory(userId: string, limit?: number, offset?: number): Promise<Record<string, unknown>[]>;
    private _validatePassword;
}
//# sourceMappingURL=UserProfileUseCase.d.ts.map