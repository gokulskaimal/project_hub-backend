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
  ISocketService: Symbol.for("ISocketService"),
  IFileService: Symbol.for("IFileService"),
  IAnalyticsService: Symbol.for("IAnalyticsService"),
  IPasswordResetService: Symbol.for("IPasswordResetService"),
  ITaskDomainService: Symbol.for("ITaskDomainService"),
  IAuthValidationService: Symbol.for("IAuthValidationService"),
  ISecurityService: Symbol.for("ISecurityService"),
  ITimeTrackingService: Symbol.for("ITimeTrackingService"),
  INotificationService: Symbol.for("INotificationService"),
  ISprintDomainService: Symbol.for("ISprintDomainService"),

  // ===== REPOSITORIES =====
  IUserRepo: Symbol.for("IUserRepo"),
  IOrgRepo: Symbol.for("IOrgRepo"),
  IInviteRepo: Symbol.for("IInviteRepo"),
  IPlanRepo: Symbol.for("IPlanRepo"),
  ISubscriptionRepo: Symbol.for("ISubscriptionRepo"),
  ITaskRepo: Symbol.for("ITaskRepo"),
  IProjectRepo: Symbol.for("IProjectRepo"),
  INotificationRepo: Symbol.for("INotificationRepo"),
  IChatRepo: Symbol.for("IChatRepo"),
  ISprintRepo: Symbol.for("ISprintRepo"),
  ITaskHistoryRepo: Symbol.for("ITaskHistoryRepo"),

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
  IGetOrgTasksUseCase: Symbol.for("IGetOrgTasksUseCase"),
  IGetUserVelocityUseCase: Symbol.for("IGetUserVelocityUseCase"),
  IResetPasswordUseCase: Symbol.for("IResetPasswordUseCase"),
  IUserProfileUseCase: Symbol.for("IUserProfileUseCase"),
  IOrganizationManagementUseCase: Symbol.for("IOrganizationManagementUseCase"),
  IOrganizationQueryUseCase: Symbol.for("IOrganizationQueryUseCase"),
  IUserQueryUseCase: Symbol.for("IUserQueryUseCase"),
  IUserManagementUseCase: Symbol.for("IUserManagementUseCase"),
  IGetMemberProjectsUseCase: Symbol.for("IGetMemberProjectsUseCase"),
  IGetMemberTasksUseCase: Symbol.for("IGetMemberTasksUseCase"),
  IAdminStatsUseCase: Symbol.for("IAdminStatsUseCase"),
  ICreatePlanUseCase: Symbol.for("ICreatePlanUseCase"),
  IGetPlanUseCase: Symbol.for("IGetPlanUseCase"),
  ICreateSubscriptionUseCase: Symbol.for("ICreateSubscriptionUseCase"),
  IVerifyPaymentUseCase: Symbol.for("IVerifyPaymentUseCase"),
  IUpdatePlanUseCase: Symbol.for("IUpdatePlanUseCase"),
  IDeletePlanUseCase: Symbol.for("IDeletePlanUseCase"),
  ICreateTaskUseCase: Symbol.for("ICreateTaskUseCase"),
  IGetTaskUseCase: Symbol.for("IGetTaskUseCase"),
  IGetTaskHistoryUseCase: Symbol.for("IGetTaskHistoryUseCase"),
  IGetTaskByIdUseCase: Symbol.for("IGetTaskByIdUseCase"),
  IUpdateTaskUseCase: Symbol.for("IUpdateTaskUseCase"),
  IDeleteTaskUseCase: Symbol.for("IDeleteTaskUseCase"),
  IToggleTimerUseCase: Symbol.for("IToggleTimerUseCase"),
  ICreateSprintUseCase: Symbol.for("ICreateSprintUseCase"),
  IUpdateSprintUseCase: Symbol.for("IUpdateSprintUseCase"),
  IDeleteSprintUseCase: Symbol.for("IDeleteSprintUseCase"),
  IGetProjectSprintsUseCase: Symbol.for("IGetProjectSprintsUseCase"),
  ICreateProjectUseCase: Symbol.for("ICreateProjectUseCase"),
  IGetProjectUseCase: Symbol.for("IGetProjectUseCase"),
  IGetProjectByIdUseCase: Symbol.for("IGetProjectByIdUseCase"),
  IGetProjectVelocityUseCase: Symbol.for("IGetProjectVelocityUseCase"),
  IUpdateProjectUseCase: Symbol.for("IUpdateProjectUseCase"),
  IDeleteProjectUseCase: Symbol.for("IDeleteProjectUseCase"),
  ICreateNotificationUseCase: Symbol.for("ICreateNotificationUseCase"),
  IGetNotificationsUseCase: Symbol.for("IGetNotificationsUseCase"),
  IMarkNotificationReadUseCase: Symbol.for("IMarkNotificationReadUseCase"),
  IMarkAllNotificationsReadUseCase: Symbol.for(
    "IMarkAllNotificationsReadUseCase",
  ),
  ISendMessageUseCase: Symbol.for("ISendMessageUseCase"),
  IGetProjectMessagesUseCase: Symbol.for("IGetProjectMessagesUseCase"),
  IEditMessageUseCase: Symbol.for("IEditMessageUseCase"),
  IDeleteMessageUseCase: Symbol.for("IDeleteMessageUseCase"),

  // ===== CONTROLLERS =====
  // AuthController: Symbol.for("AuthController"),
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
  OrganizationController: Symbol.for("OrganizationController"),
  NotificationController: Symbol.for("NotificationController"),
  ChatController: Symbol.for("ChatController"),
  UploadController: Symbol.for("UploadController"),
  SprintController: Symbol.for("SprintController"),
  AdminInvoiceController: Symbol.for("AdminInvoiceController"),
  ManagerInvoiceController: Symbol.for("ManagerInvoiceController"),

  // ===== MIDDLEWARES =====
  AuthMiddleware: Symbol.for("AuthMiddleware"),
  ValidationMiddleware: Symbol.for("ValidationMiddleware"),
  ErrorMiddleware: Symbol.for("ErrorMiddleware"),

  // ===== DATABASE =====
  DatabaseConnection: Symbol.for("DatabaseConnection"),

  // ===== SOCKET =====
  SocketServer: Symbol.for("SocketServer"),

  // ===== CONFIGURATION =====
  AppConfig: Symbol.for("AppConfig"),
  DatabaseConfig: Symbol.for("DatabaseConfig"),
  JwtConfig: Symbol.for("JwtConfig"),
  EmailConfig: Symbol.for("EmailConfig"),
  IBootstrapService: Symbol.for("IBootstrapService"),

  // ===== INVOICE SYSTEM =====
  IInvoiceRepo: Symbol.for("IInvoiceRepo"),
  IGetAdminInvoicesUseCase: Symbol.for("IGetAdminInvoicesUseCase"),
  IGetOrgInvoicesUseCase: Symbol.for("IGetOrgInvoicesUseCase"),
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
