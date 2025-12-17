export const TYPES = {
  // ===== SERVICES =====
  ILogger: Symbol.for("ILogger"),
  IHashService: Symbol.for("IHashService"),
  IJwtService: Symbol.for("IJwtService"),
  IJwtProvider: Symbol.for("IJwtProvider"),
  IEmailService: Symbol.for("IEmailService"),
  IOtpService: Symbol.for("IOtpService"),
  ICacheService: Symbol.for("ICacheService"),
  IGoogleAuthService: Symbol.for("IGoogleAuthService"),
  IRazorpayService: Symbol.for("IRazorpayService"),
  
  

  // ===== REPOSITORIES =====
  IUserRepo: Symbol.for("IUserRepo"),
  IOrgRepo: Symbol.for("IOrgRepo"),
  IInviteRepo: Symbol.for("IInviteRepo"),
  IPlanRepo: Symbol.for("IPlanRepo"),
  ISubscriptionRepo: Symbol.for("ISubscriptionRepo"),
  ITaskRepo: Symbol.for("ITaskRepo"),
  IProjectRepo: Symbol.for("IProjectRepo"),

  // ===== USE CASES =====
  ILoginUseCase: Symbol.for("ILoginUseCase"),
  IRegisterUseCase: Symbol.for("IRegisterUseCase"),
  IGoogleSignInUseCase: Symbol.for("IGoogleSignInUseCase"),
  ITokenRefreshUseCase: Symbol.for("ITokenRefreshUseCase"),
  ILogoutUseCase: Symbol.for("ILogoutUseCase"),
  IVerifyEmailUseCase: Symbol.for("IVerifyEmailUseCase"),
  IValidateTokenUseCase: Symbol.for("IValidateTokenUseCase"),
  IRegisterManagerUseCase: Symbol.for("IRegisterManagerUseCase"),
  ISendOtpUseCase: Symbol.for("ISendOtpUseCase"),
  IVerifyOtpUseCase: Symbol.for("IVerifyOtpUseCase"),
  ICompleteSignupUseCase: Symbol.for("ICompleteSignupUseCase"),
  IAcceptUseCase: Symbol.for("IAcceptUseCase"),
  IInviteMemberUseCase: Symbol.for("IInviteMemberUseCase"),
  IResetPasswordUseCase: Symbol.for("IResetPasswordUseCase"),
  IUserProfileUseCase: Symbol.for("IUserProfileUseCase"),
  IOrganizationManagementUseCase: Symbol.for("IOrganizationManagementUseCase"),
  IOrganizationQueryUseCase: Symbol.for("IOrganizationQueryUseCase"),
  IUserQueryUseCase: Symbol.for("IUserQueryUseCase"),
  IUserManagementUseCase: Symbol.for("IUserManagementUseCase"),
  IAdminStatsUseCase: Symbol.for("IAdminStatsUseCase"),
  ICreatePlanUseCase: Symbol.for("ICreatePlanUseCase"),
  IGetPlanUseCase: Symbol.for("IGetPlanUseCase"),
  ICreateSubscriptionUseCase: Symbol.for("ICreateSubscriptionUseCase"),
  IVerifyPaymentUseCase: Symbol.for("IVerifyPaymentUseCase"),
  IUpdatePlanUseCase: Symbol.for("IUpdatePlanUseCase"),
  IDeletePlanUseCase: Symbol.for("IDeletePlanUseCase"),
  ICreateTaskUseCase: Symbol.for("ICreateTaskUseCase"),
  IGetTaskUseCase: Symbol.for("IGetTaskUseCase"),
  IUpdateTaskUseCase: Symbol.for("IUpdateTaskUseCase"),
  IDeleteTaskUseCase: Symbol.for("IDeleteTaskUseCase"),
  ICreateProjectUseCase: Symbol.for("ICreateProjectUseCase"),
  IGetProjectUseCase: Symbol.for("IGetProjectUseCase"),
  IUpdateProjectUseCase: Symbol.for("IUpdateProjectUseCase"),
  IDeleteProjectUseCase: Symbol.for("IDeleteProjectUseCase"),

  // ===== CONTROLLERS =====
  // AuthController: Symbol.for("AuthController"), // Removed in favor of split controllers
  SessionController: Symbol.for("SessionController"),
  RegistrationController: Symbol.for("RegistrationController"),
  InviteController: Symbol.for("InviteController"),
  PasswordController: Symbol.for("PasswordController"),

  AdminUserController: Symbol.for("AdminUserController"),
  AdminOrgController: Symbol.for("AdminOrgController"),
  AdminPlanController: Symbol.for("AdminPlanController"),
  ManagerController: Symbol.for("ManagerController"),
  UserController: Symbol.for("UserController"),
  ProjectController: Symbol.for("ProjectController"),
  WebhookController: Symbol.for("WebhookController"),
  PaymentController: Symbol.for("PaymentController"),
  TaskController: Symbol.for("TaskController"),
  

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
  IBootstrapService: Symbol.for("IBootstrapService"),
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
