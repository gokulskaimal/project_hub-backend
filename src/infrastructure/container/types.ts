// Service Types
export const TYPES = {
  // ===== SERVICES =====
  ILogger: Symbol.for("ILogger"),
  IHashService: Symbol.for("IHashService"),
  IJwtService: Symbol.for("IJwtService"),
  IJwtProvider: Symbol.for("IJwtProvider"),
  IEmailService: Symbol.for("IEmailService"),
  IOtpService: Symbol.for("IOtpService"),
  ICacheService: Symbol.for("ICacheService"),

  // ===== REPOSITORIES =====
  IUserRepo: Symbol.for("IUserRepo"),
  IOrgRepo: Symbol.for("IOrgRepo"),
  IInviteRepo: Symbol.for("IInviteRepo"),

  // ===== USE CASES =====
  IAuthUseCases: Symbol.for("IAuthUseCases"),
  IRegisterManagerUseCase: Symbol.for("IRegisterManagerUseCase"),
  ISendOtpUseCase: Symbol.for("ISendOtpUseCase"),
  IVerifyOtpUseCase: Symbol.for("IVerifyOtpUseCase"),
  ICompleteSignupUseCase: Symbol.for("ICompleteSignupUseCase"),
  IAcceptUseCase: Symbol.for("IAcceptUseCase"),
  IInviteMemberUseCase: Symbol.for("IInviteMemberUseCase"),
  IResetPasswordUseCase: Symbol.for("IResetPasswordUseCase"),
  IUserProfileUseCase: Symbol.for("IUserProfileUseCase"),

  // ===== CONTROLLERS =====
  AuthController: Symbol.for("AuthController"),
  AdminController: Symbol.for("AdminController"),
  ManagerController: Symbol.for("ManagerController"),
  UserController: Symbol.for("UserController"),
  ProjectController: Symbol.for("ProjectController"),

  // ===== MIDDLEWARES =====
  AuthMiddleware: Symbol.for("AuthMiddleware"),
  ValidationMiddleware: Symbol.for("ValidationMiddleware"),
  ErrorMiddleware: Symbol.for("ErrorMiddleware"),

  // ===== DATABASE =====
  DatabaseConnection: Symbol.for("DatabaseConnection"),

  // ===== CONFIGURATION =====
  AppConfig: Symbol.for("AppConfig"),
  DatabaseConfig: Symbol.for("DatabaseConfig"),
  JwtConfig: Symbol.for("JwtConfig"),
  EmailConfig: Symbol.for("EmailConfig"),
} as const;

/**
 * Type guard to check if a type identifier exists
 * @param typeId - The type identifier to check
 * @returns True if the type exists
 */
export function isValidType(typeId: symbol): boolean {
  return Object.values(TYPES).includes(typeId);
}

/**
 * Get all available type identifiers
 * @returns Array of all type identifiers
 */
export function getAllTypes(): symbol[] {
  return Object.values(TYPES);
}

/**
 * Get type identifier by name
 * @param name - The name of the type
 * @returns The symbol identifier or undefined if not found
 */
export function getTypeByName(name: keyof typeof TYPES): symbol {
  return TYPES[name];
}
