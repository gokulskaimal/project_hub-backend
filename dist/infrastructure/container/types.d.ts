export declare const TYPES: {
    readonly ILogger: symbol;
    readonly IHashService: symbol;
    readonly IJwtService: symbol;
    readonly IJwtProvider: symbol;
    readonly IEmailService: symbol;
    readonly IOtpService: symbol;
    readonly ICacheService: symbol;
    readonly IUserRepo: symbol;
    readonly IOrgRepo: symbol;
    readonly IInviteRepo: symbol;
    readonly IAuthUseCases: symbol;
    readonly IRegisterManagerUseCase: symbol;
    readonly ISendOtpUseCase: symbol;
    readonly IVerifyOtpUseCase: symbol;
    readonly ICompleteSignupUseCase: symbol;
    readonly IAcceptUseCase: symbol;
    readonly IInviteMemberUseCase: symbol;
    readonly IResetPasswordUseCase: symbol;
    readonly IUserProfileUseCase: symbol;
    readonly IOrganizationManagementUseCase: symbol;
    readonly AuthController: symbol;
    readonly AdminController: symbol;
    readonly ManagerController: symbol;
    readonly UserController: symbol;
    readonly ProjectController: symbol;
    readonly AuthMiddleware: symbol;
    readonly ValidationMiddleware: symbol;
    readonly ErrorMiddleware: symbol;
    readonly DatabaseConnection: symbol;
    readonly AppConfig: symbol;
    readonly DatabaseConfig: symbol;
    readonly JwtConfig: symbol;
    readonly EmailConfig: symbol;
};
/**
 * Type guard to check if a type identifier exists
 * @param typeId - The type identifier to check
 * @returns True if the type exists
 */
export declare function isValidType(typeId: symbol): boolean;
/**
 * Get all available type identifiers
 * @returns Array of all type identifiers
 */
export declare function getAllTypes(): symbol[];
/**
 * Get type identifier by name
 * @param name - The name of the type
 * @returns The symbol identifier or undefined if not found
 */
export declare function getTypeByName(name: keyof typeof TYPES): symbol;
//# sourceMappingURL=types.d.ts.map