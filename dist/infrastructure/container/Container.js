"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = exports.diContainer = void 0;
// src/infrastructure/container/Container.ts
require("reflect-metadata");
const inversify_1 = require("inversify");
const types_1 = require("./types");
// Infrastructure Implementations - Services
const Logger_1 = require("../services/Logger");
const BootstrapService_1 = require("../services/BootstrapService");
const HashService_1 = require("../services/HashService");
const JwtService_1 = require("../services/JwtService");
const GoogleAuthService_1 = require("../services/GoogleAuthService");
const EmailService_1 = require("../services/EmailService");
const OTPService_1 = require("../services/OTPService");
const JsonWebTokenProvider_1 = require("../services/providers/JsonWebTokenProvider");
const RedisCacheService_1 = require("../services/RedisCacheService");
const InMemoryCacheService_1 = require("../services/InMemoryCacheService");
const RazorpayService_1 = require("../services/RazorpayService");
const SocketService_1 = require("../services/SocketService");
const SocketServer_1 = require("../../presentation/socket/SocketServer");
const CloudinaryService_1 = require("../services/CloudinaryService");
// Infrastructure Implementations - Repositories
const UserRepo_1 = require("../repositories/UserRepo");
const OrgRepo_1 = require("../repositories/OrgRepo");
const InviteRepo_1 = require("../repositories/InviteRepo");
const PlanRepo_1 = require("../repositories/PlanRepo");
const SubscriptionRepo_1 = require("../repositories/SubscriptionRepo");
const TaskRepo_1 = require("../repositories/TaskRepo");
const ProjectRepo_1 = require("../repositories/ProjectRepo");
const NotificationRepo_1 = require("../repositories/NotificationRepo");
const SprintRepo_1 = require("../repositories/SprintRepo");
// Application Use Cases
const LoginUseCase_1 = require("../../application/useCase/LoginUseCase");
const RegisterUseCase_1 = require("../../application/useCase/RegisterUseCase");
const GoogleSignInUseCase_1 = require("../../application/useCase/GoogleSignInUseCase");
const TokenRefreshUseCase_1 = require("../../application/useCase/TokenRefreshUseCase");
const LogoutUseCase_1 = require("../../application/useCase/LogoutUseCase");
const VerifyEmailUseCase_1 = require("../../application/useCase/VerifyEmailUseCase");
const ValidateTokenUseCase_1 = require("../../application/useCase/ValidateTokenUseCase");
const RegisterManagerUseCase_1 = require("../../application/useCase/RegisterManagerUseCase");
const SendOtpUseCase_1 = require("../../application/useCase/SendOtpUseCase");
const VerifyOtpUseCase_1 = require("../../application/useCase/VerifyOtpUseCase");
const CompleteSignupUseCase_1 = require("../../application/useCase/CompleteSignupUseCase");
const AcceptUseCase_1 = require("../../application/useCase/AcceptUseCase");
const InviteMemberUseCase_1 = require("../../application/useCase/InviteMemberUseCase");
const ResetPasswordUseCase_1 = require("../../application/useCase/ResetPasswordUseCase");
const UserProfileUseCase_1 = require("../../application/useCase/UserProfileUseCase");
const OrganizationManagementUseCase_1 = require("../../application/useCase/OrganizationManagementUseCase");
const CreatePlanUseCase_1 = require("../../application/useCase/CreatePlanUseCase");
const GetPlansUseCase_1 = require("../../application/useCase/GetPlansUseCase");
const CreateSubscriptionUseCase_1 = require("../../application/useCase/CreateSubscriptionUseCase");
const VerifyPaymentUseCase_1 = require("../../application/useCase/VerifyPaymentUseCase");
const UpdatePlanUseCase_1 = require("../../application/useCase/UpdatePlanUseCase");
const DeletePlanUseCase_1 = require("../../application/useCase/DeletePlanUseCase");
const OrganizationQueryUseCase_1 = require("../../application/useCase/OrganizationQueryUseCase");
const UserQueryUseCase_1 = require("../../application/useCase/UserQueryUseCase");
const UserManagementUseCase_1 = require("../../application/useCase/UserManagementUseCase");
const AdminStatsUseCase_1 = require("../../application/useCase/AdminStatsUseCase");
const CreateTaskUseCase_1 = require("../../application/useCase/CreateTaskUseCase");
const GetTaskUseCase_1 = require("../../application/useCase/GetTaskUseCase");
const UpdateTaskUseCase_1 = require("../../application/useCase/UpdateTaskUseCase");
const DeleteTaskUseCase_1 = require("../../application/useCase/DeleteTaskUseCase");
const CreateNotificationUseCase_1 = require("../../application/useCase/CreateNotificationUseCase");
const GetNotificationsUseCase_1 = require("../../application/useCase/GetNotificationsUseCase");
const MarkNotificationReadUseCase_1 = require("../../application/useCase/MarkNotificationReadUseCase");
const MarkAllNotificationsReadUseCase_1 = require("../../application/useCase/MarkAllNotificationsReadUseCase");
const CreateProjectUseCase_1 = require("../../application/useCase/CreateProjectUseCase");
const GetProjectUseCase_1 = require("../../application/useCase/GetProjectUseCase");
const GetProjectByIdUseCase_1 = require("../../application/useCase/GetProjectByIdUseCase");
const UpdateProjectUseCase_1 = require("../../application/useCase/UpdateProjectUseCase");
const DeleteProjectUseCase_1 = require("../../application/useCase/DeleteProjectUseCase");
const GetMemberProjectsUseCase_1 = require("../../application/useCase/GetMemberProjectsUseCase");
const GetMemberTasksUseCase_1 = require("../../application/useCase/GetMemberTasksUseCase");
const ToggleTimerUseCase_1 = require("../../application/useCase/ToggleTimerUseCase");
// Presentation Controllers
const SessionController_1 = require("../../presentation/controllers/auth/SessionController");
const RegistrationController_1 = require("../../presentation/controllers/auth/RegistrationController");
const InviteController_1 = require("../../presentation/controllers/auth/InviteController");
const PasswordController_1 = require("../../presentation/controllers/auth/PasswordController");
const UserController_1 = require("../../presentation/controllers/user/UserController");
const ManagerController_1 = require("../../presentation/controllers/manager/ManagerController");
const PaymentController_1 = require("../../presentation/controllers/PaymentController");
const WebhookController_1 = require("../../presentation/controllers/WebhookController");
const AdminUserController_1 = require("../../presentation/controllers/admin/AdminUserController");
const AdminOrgController_1 = require("../../presentation/controllers/admin/AdminOrgController");
const AdminPlanController_1 = require("../../presentation/controllers/admin/AdminPlanController");
const OrganizationController_1 = require("../../presentation/controllers/OrganizationController");
const TaskController_1 = require("../../presentation/controllers/manager/TaskController");
const ProjectController_1 = require("../../presentation/controllers/manager/ProjectController");
const NotificationController_1 = require("../../presentation/controllers/NotificationController");
const ChatController_1 = require("../../presentation/controllers/ChatController");
const UploadController_1 = require("../../presentation/controllers/UploadController");
const SprintController_1 = require("../../presentation/controllers/manager/SprintController");
// Chat Implementations
const ChatRepo_1 = require("../repositories/ChatRepo");
const SendMessageUseCase_1 = require("../../application/useCase/SendMessageUseCase");
const GetProjectMessagesUseCase_1 = require("../../application/useCase/GetProjectMessagesUseCase");
const EditMessageUseCase_1 = require("../../application/useCase/EditMessageUseCase");
const DeleteMessageUseCase_1 = require("../../application/useCase/DeleteMessageUseCase");
/**
 * DIContainer
 *
 * - Binds services, repositories, use-cases, and controllers.
 * - Provides an async init() method to initialize async services (e.g., Redis).
 * - Provides dispose() for tests/graceful shutdown.
 */
class DIContainer {
    constructor() {
        this._initialized = false;
        this._container = new inversify_1.Container();
        this._configureBindings();
    }
    /**
     * Bindings (unchanged)
     */
    _configureBindings() {
        this._bindServices();
        this._bindRepositories();
        this._bindUseCases();
        this._bindControllers();
    }
    _bindServices() {
        this._container.bind(types_1.TYPES.ILogger).to(Logger_1.Logger).inSingletonScope();
        this._container
            .bind(types_1.TYPES.IBootstrapService)
            .to(BootstrapService_1.BootstrapService)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.IHashService)
            .to(HashService_1.HashService)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.IJwtProvider)
            .to(JsonWebTokenProvider_1.JsonWebTokenProvider)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.IJwtService)
            .to(JwtService_1.JwtService)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.IEmailService)
            .to(EmailService_1.EmailService)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.IOtpService)
            .to(OTPService_1.OtpService)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.IGoogleAuthService)
            .to(GoogleAuthService_1.GoogleAuthService)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.IRazorpayService)
            .to(RazorpayService_1.RazorpayService)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.ISocketService)
            .to(SocketService_1.SocketService)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.SocketServer)
            .to(SocketServer_1.SocketServer)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.IFileService)
            .to(CloudinaryService_1.CloudinaryService)
            .inSingletonScope();
        const useRedis = String(process.env.USE_REDIS || "").toLowerCase() === "true";
        if (useRedis) {
            this._container
                .bind(types_1.TYPES.ICacheService)
                .to(RedisCacheService_1.RedisCacheService)
                .inSingletonScope();
        }
        else {
            this._container
                .bind(types_1.TYPES.ICacheService)
                .to(InMemoryCacheService_1.InMemoryCacheService)
                .inSingletonScope();
        }
    }
    _bindRepositories() {
        this._container
            .bind(types_1.TYPES.IUserRepo)
            .to(UserRepo_1.UserRepo)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.IOrgRepo)
            .to(OrgRepo_1.OrgRepo)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.IInviteRepo)
            .to(InviteRepo_1.InviteRepo)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.IPlanRepo)
            .to(PlanRepo_1.PlanRepo)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.ISubscriptionRepo)
            .to(SubscriptionRepo_1.SubscriptionRepo)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.ITaskRepo)
            .to(TaskRepo_1.TaskRepo)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.IProjectRepo)
            .to(ProjectRepo_1.ProjectRepo)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.INotificationRepo)
            .to(NotificationRepo_1.NotificationRepo)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.IChatRepo)
            .to(ChatRepo_1.ChatRepo)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.ISprintRepo)
            .to(SprintRepo_1.SprintRepo)
            .inSingletonScope();
    }
    _bindUseCases() {
        this._container
            .bind(types_1.TYPES.ILoginUseCase)
            .to(LoginUseCase_1.LoginUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IRegisterUseCase)
            .to(RegisterUseCase_1.RegisterUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IGoogleSignInUseCase)
            .to(GoogleSignInUseCase_1.GoogleSignInUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.ITokenRefreshUseCase)
            .to(TokenRefreshUseCase_1.TokenRefreshUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.ILogoutUseCase)
            .to(LogoutUseCase_1.LogoutUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IVerifyEmailUseCase)
            .to(VerifyEmailUseCase_1.VerifyEmailUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IValidateTokenUseCase)
            .to(ValidateTokenUseCase_1.ValidateTokenUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IRegisterManagerUseCase)
            .to(RegisterManagerUseCase_1.RegisterManagerUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.ISendOtpUseCase)
            .to(SendOtpUseCase_1.SendOtpUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IVerifyOtpUseCase)
            .to(VerifyOtpUseCase_1.VerifyOtpUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.ICompleteSignupUseCase)
            .to(CompleteSignupUseCase_1.CompleteSignupUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IAcceptUseCase)
            .to(AcceptUseCase_1.AcceptUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IInviteMemberUseCase)
            .to(InviteMemberUseCase_1.InviteMemberUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IResetPasswordUseCase)
            .to(ResetPasswordUseCase_1.ResetPasswordUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IUserProfileUseCase)
            .to(UserProfileUseCase_1.UserProfileUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IOrganizationManagementUseCase)
            .to(OrganizationManagementUseCase_1.OrganizationManagementUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.ICreatePlanUseCase)
            .to(CreatePlanUseCase_1.CreatePlanUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IGetPlanUseCase)
            .to(GetPlansUseCase_1.GetPlansUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.ICreateSubscriptionUseCase)
            .to(CreateSubscriptionUseCase_1.CreateSubscriptionUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IVerifyPaymentUseCase)
            .to(VerifyPaymentUseCase_1.VerifyPaymentUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IUpdatePlanUseCase)
            .to(UpdatePlanUseCase_1.UpdatePlanUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IDeletePlanUseCase)
            .to(DeletePlanUseCase_1.DeletePlanUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IOrganizationQueryUseCase)
            .to(OrganizationQueryUseCase_1.OrganizationQueryUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IUserQueryUseCase)
            .to(UserQueryUseCase_1.UserQueryUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IUserManagementUseCase)
            .to(UserManagementUseCase_1.UserManagementUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IAdminStatsUseCase)
            .to(AdminStatsUseCase_1.AdminStatsUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.ICreateTaskUseCase)
            .to(CreateTaskUseCase_1.CreateTaskUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IGetTaskUseCase)
            .to(GetTaskUseCase_1.GetTaskUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IUpdateTaskUseCase)
            .to(UpdateTaskUseCase_1.UpdateTaskUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IDeleteTaskUseCase)
            .to(DeleteTaskUseCase_1.DeleteTaskUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IToggleTimerUseCase)
            .to(ToggleTimerUseCase_1.ToggleTimerUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.ICreateProjectUseCase)
            .to(CreateProjectUseCase_1.CreateProjectUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IGetProjectUseCase)
            .to(GetProjectUseCase_1.GetProjectUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IGetProjectByIdUseCase)
            .to(GetProjectByIdUseCase_1.GetProjectByIdUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IUpdateProjectUseCase)
            .to(UpdateProjectUseCase_1.UpdateProjectUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IDeleteProjectUseCase)
            .to(DeleteProjectUseCase_1.DeleteProjectUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IGetMemberProjectsUseCase)
            .to(GetMemberProjectsUseCase_1.GetMemberProjectsUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IGetMemberTasksUseCase)
            .to(GetMemberTasksUseCase_1.GetMemberTasksUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.ICreateNotificationUseCase)
            .to(CreateNotificationUseCase_1.CreateNotificationUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IGetNotificationsUseCase)
            .to(GetNotificationsUseCase_1.GetNotificationsUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IMarkNotificationReadUseCase)
            .to(MarkNotificationReadUseCase_1.MarkNotificationReadUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IMarkAllNotificationsReadUseCase)
            .to(MarkAllNotificationsReadUseCase_1.MarkAllNotificationsReadUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.ISendMessageUseCase)
            .to(SendMessageUseCase_1.SendMessageUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IGetProjectMessagesUseCase)
            .to(GetProjectMessagesUseCase_1.GetProjectMessagesUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IEditMessageUseCase)
            .to(EditMessageUseCase_1.EditMessageUseCase)
            .inTransientScope();
        this._container
            .bind(types_1.TYPES.IDeleteMessageUseCase)
            .to(DeleteMessageUseCase_1.DeleteMessageUseCase)
            .inTransientScope();
    }
    _bindControllers() {
        /*
        this._container
          .bind<AuthController>(TYPES.AuthController)
          .to(AuthController)
          .inSingletonScope();
        */
        this._container
            .bind(types_1.TYPES.SessionController)
            .to(SessionController_1.SessionController)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.RegistrationController)
            .to(RegistrationController_1.RegistrationController)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.InviteController)
            .to(InviteController_1.InviteController)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.PasswordController)
            .to(PasswordController_1.PasswordController)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.AdminUserController)
            .to(AdminUserController_1.AdminUserController)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.AdminOrgController)
            .to(AdminOrgController_1.AdminOrgController)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.OrganizationController)
            .to(OrganizationController_1.OrganizationController)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.AdminPlanController)
            .to(AdminPlanController_1.AdminPlanController)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.UserController)
            .to(UserController_1.UserController)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.ManagerController)
            .to(ManagerController_1.ManagerController)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.PaymentController)
            .to(PaymentController_1.PaymentController)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.WebhookController)
            .to(WebhookController_1.WebhookController)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.TaskController)
            .to(TaskController_1.TaskController)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.ProjectController)
            .to(ProjectController_1.ProjectController)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.NotificationController)
            .to(NotificationController_1.NotificationController)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.ChatController)
            .to(ChatController_1.ChatController)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.UploadController)
            .to(UploadController_1.UploadController)
            .inSingletonScope();
        this._container
            .bind(types_1.TYPES.SprintController)
            .to(SprintController_1.SprintController)
            .inSingletonScope();
    }
    /**
     * Initialize async services if required.
     * - Ensures initialization runs only once.
     * - Looks for services that expose an async `connect()` or `init()` method and invokes it.
     */
    async init() {
        if (this._initialized)
            return;
        this._initialized = true;
        // Try to initialize cache service if it has async startup
        try {
            if (this._container.isBound(types_1.TYPES.ICacheService)) {
                const cache = this._container.get(types_1.TYPES.ICacheService);
                if (cache && typeof cache.connect === "function") {
                    // If RedisCacheService provides an async connect(), await it.
                    await cache.connect();
                }
                else if (cache && typeof cache.init === "function") {
                    await cache.init();
                }
            }
        }
        catch (err) {
            // If init fails, rethrow so caller can decide to fail-fast or continue.
            const logger = this._container.isBound(types_1.TYPES.ILogger)
                ? this._container.get(types_1.TYPES.ILogger)
                : console;
            logger?.warn?.("Cache service initialization failed", err);
            throw err;
        }
    }
    /**
     * Dispose / cleanup helpers (useful in tests or graceful shutdown)
     */
    async dispose() {
        try {
            // Try to close cache connections if present
            if (this._container.isBound(types_1.TYPES.ICacheService)) {
                const cache = this._container.get(types_1.TYPES.ICacheService);
                if (cache && typeof cache.disconnect === "function")
                    await cache.disconnect();
                if (cache && typeof cache.close === "function")
                    await cache.close();
            }
        }
        catch (err) {
            // best-effort
            const logger = this._container.isBound(types_1.TYPES.ILogger)
                ? this._container.get(types_1.TYPES.ILogger)
                : console;
            logger?.warn?.("Error during container dispose", err);
        }
    }
    get container() {
        return this._container;
    }
    get(serviceIdentifier) {
        return this._container.get(serviceIdentifier);
    }
    isBound(serviceIdentifier) {
        return this._container.isBound(serviceIdentifier);
    }
    unbind(serviceIdentifier) {
        this._container.unbind(serviceIdentifier);
    }
    rebind(serviceIdentifier) {
        return this._container.rebind(serviceIdentifier);
    }
}
// Export container instance (constructed eagerly but init() must be called before use of async deps)
exports.diContainer = new DIContainer();
exports.container = exports.diContainer.container;
//# sourceMappingURL=Container.js.map