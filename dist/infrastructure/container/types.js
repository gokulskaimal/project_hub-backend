"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TYPES = void 0;
exports.isValidType = isValidType;
exports.getAllTypes = getAllTypes;
exports.getTypeByName = getTypeByName;
// Service Types
exports.TYPES = {
    // ===== SERVICES =====
    ILogger: Symbol.for('ILogger'),
    IHashService: Symbol.for('IHashService'),
    IJwtService: Symbol.for('IJwtService'),
    IJwtProvider: Symbol.for('IJwtProvider'),
    IEmailService: Symbol.for('IEmailService'),
    IOtpService: Symbol.for('IOtpService'),
    // ===== REPOSITORIES =====
    IUserRepo: Symbol.for('IUserRepo'),
    IOrgRepo: Symbol.for('IOrgRepo'),
    IInviteRepo: Symbol.for('IInviteRepo'),
    // ===== USE CASES =====
    IAuthUseCases: Symbol.for('IAuthUseCases'),
    IRegisterManagerUseCase: Symbol.for('IRegisterManagerUseCase'),
    ISendOtpUseCase: Symbol.for('ISendOtpUseCase'),
    IVerifyOtpUseCase: Symbol.for('IVerifyOtpUseCase'),
    ICompleteSignupUseCase: Symbol.for('ICompleteSignupUseCase'),
    IAcceptUseCase: Symbol.for('IAcceptUseCase'),
    IInviteMemberUseCase: Symbol.for('IInviteMemberUseCase'),
    IResetPasswordUseCase: Symbol.for('IResetPasswordUseCase'),
    IUserProfileUseCase: Symbol.for('IUserProfileUseCase'),
    // ===== CONTROLLERS =====
    AuthController: Symbol.for('AuthController'),
    AdminController: Symbol.for('AdminController'),
    ManagerController: Symbol.for('ManagerController'),
    UserController: Symbol.for('UserController'),
    ProjectController: Symbol.for('ProjectController'),
    // ===== MIDDLEWARES =====
    AuthMiddleware: Symbol.for('AuthMiddleware'),
    ValidationMiddleware: Symbol.for('ValidationMiddleware'),
    ErrorMiddleware: Symbol.for('ErrorMiddleware'),
    // ===== DATABASE =====
    DatabaseConnection: Symbol.for('DatabaseConnection'),
    // ===== CONFIGURATION =====
    AppConfig: Symbol.for('AppConfig'),
    DatabaseConfig: Symbol.for('DatabaseConfig'),
    JwtConfig: Symbol.for('JwtConfig'),
    EmailConfig: Symbol.for('EmailConfig')
};
/**
 * Type guard to check if a type identifier exists
 * @param typeId - The type identifier to check
 * @returns True if the type exists
 */
function isValidType(typeId) {
    return Object.values(exports.TYPES).includes(typeId);
}
/**
 * Get all available type identifiers
 * @returns Array of all type identifiers
 */
function getAllTypes() {
    return Object.values(exports.TYPES);
}
/**
 * Get type identifier by name
 * @param name - The name of the type
 * @returns The symbol identifier or undefined if not found
 */
function getTypeByName(name) {
    return exports.TYPES[name];
}
//# sourceMappingURL=types.js.map