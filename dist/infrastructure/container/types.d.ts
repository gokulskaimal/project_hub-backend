export declare const TYPES: {
    readonly ILogger: symbol;
    readonly IHashService: symbol;
    readonly IJwtService: symbol;
    readonly IJwtProvider: symbol;
    readonly IEmailService: symbol;
    readonly IOtpService: symbol;
    readonly ICacheService: symbol;
    readonly IGoogleAuthService: symbol;
    readonly IRazorpayService: symbol;
    readonly ISocketService: symbol;
    readonly IUserRepo: symbol;
    readonly IOrgRepo: symbol;
    readonly IInviteRepo: symbol;
    readonly IPlanRepo: symbol;
    readonly ISubscriptionRepo: symbol;
    readonly ITaskRepo: symbol;
    readonly IProjectRepo: symbol;
    readonly INotificationRepo: symbol;
    readonly IChatRepo: symbol;
    readonly ILoginUseCase: symbol;
    readonly IRegisterUseCase: symbol;
    readonly IGoogleSignInUseCase: symbol;
    readonly ITokenRefreshUseCase: symbol;
    readonly ILogoutUseCase: symbol;
    readonly IVerifyEmailUseCase: symbol;
    readonly IValidateTokenUseCase: symbol;
    readonly IRegisterManagerUseCase: symbol;
    readonly ISendOtpUseCase: symbol;
    readonly IVerifyOtpUseCase: symbol;
    readonly ICompleteSignupUseCase: symbol;
    readonly IAcceptUseCase: symbol;
    readonly IInviteMemberUseCase: symbol;
    readonly IResetPasswordUseCase: symbol;
    readonly IUserProfileUseCase: symbol;
    readonly IOrganizationManagementUseCase: symbol;
    readonly IOrganizationQueryUseCase: symbol;
    readonly IUserQueryUseCase: symbol;
    readonly IUserManagementUseCase: symbol;
    readonly IGetMemberProjectsUseCase: symbol;
    readonly IGetMemberTasksUseCase: symbol;
    readonly IAdminStatsUseCase: symbol;
    readonly ICreatePlanUseCase: symbol;
    readonly IGetPlanUseCase: symbol;
    readonly ICreateSubscriptionUseCase: symbol;
    readonly IVerifyPaymentUseCase: symbol;
    readonly IUpdatePlanUseCase: symbol;
    readonly IDeletePlanUseCase: symbol;
    readonly ICreateTaskUseCase: symbol;
    readonly IGetTaskUseCase: symbol;
    readonly IUpdateTaskUseCase: symbol;
    readonly IDeleteTaskUseCase: symbol;
    readonly ICreateProjectUseCase: symbol;
    readonly IGetProjectUseCase: symbol;
    readonly IGetProjectByIdUseCase: symbol;
    readonly IUpdateProjectUseCase: symbol;
    readonly IDeleteProjectUseCase: symbol;
    readonly ICreateNotificationUseCase: symbol;
    readonly IGetNotificationsUseCase: symbol;
    readonly IMarkNotificationReadUseCase: symbol;
    readonly IMarkAllNotificationsReadUseCase: symbol;
    readonly ISendMessageUseCase: symbol;
    readonly IGetProjectMessagesUseCase: symbol;
    readonly IEditMessageUseCase: symbol;
    readonly IDeleteMessageUseCase: symbol;
    readonly SessionController: symbol;
    readonly RegistrationController: symbol;
    readonly InviteController: symbol;
    readonly PasswordController: symbol;
    readonly AdminUserController: symbol;
    readonly AdminOrgController: symbol;
    readonly AdminPlanController: symbol;
    readonly ManagerController: symbol;
    readonly UserController: symbol;
    readonly ProjectController: symbol;
    readonly WebhookController: symbol;
    readonly PaymentController: symbol;
    readonly TaskController: symbol;
    readonly OrganizationController: symbol;
    readonly NotificationController: symbol;
    readonly ChatController: symbol;
    readonly AuthMiddleware: symbol;
    readonly ValidationMiddleware: symbol;
    readonly ErrorMiddleware: symbol;
    readonly DatabaseConnection: symbol;
    readonly SocketServer: symbol;
    readonly AppConfig: symbol;
    readonly DatabaseConfig: symbol;
    readonly JwtConfig: symbol;
    readonly EmailConfig: symbol;
    readonly IBootstrapService: symbol;
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