import "reflect-metadata";
import { Container } from "inversify";
import { AppConfig, config } from "../../config/AppConfig";
import { TYPES } from "./types";

//Interfaces - Services
import { ILogger } from "../../application/interface/services/ILogger";
import { IHashService } from "../../application/interface/services/IHashService";
import { IJwtService } from "../../application/interface/services/IJwtService";
import { IEmailService } from "../../application/interface/services/IEmailService";
import { IOtpService } from "../../application/interface/services/IOtpService";
import { ICacheService } from "../../application/interface/services/ICacheService";
import { IGoogleAuthService } from "../../application/interface/services/IGoogleAuthService";
import { IRazorpayService } from "../../application/interface/services/IRazorpayService";
import { IPlanRepo } from "../../application/interface/repositories/IPlanRepo";
import { ISubscriptionRepo } from "../../application/interface/repositories/ISubscriptionRepo";
import { ISocketService } from "../../application/interface/services/ISocketService";
import { IFileService } from "../../application/interface/services/IFileService";
import { IAnalyticsService } from "../../application/interface/services/IAnalyticsService";
import { IPasswordResetService } from "../../application/interface/services/IPasswordResetService";
import { ITaskDomainService } from "../../domain/interface/services/ITaskDomainService";
import { IAuthValidationService } from "../../application/interface/services/IAuthValidationService";
import { ISecurityService } from "../../application/interface/services/ISecurityService";
import { ITimeTrackingService } from "../../domain/interface/services/ITimeTrackingService";
import { INotificationService } from "../../domain/interface/services/INotificationService";
import { ISprintDomainService } from "../../domain/interface/services/ISprintDomainService";

//Interfaces - Repositories
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { IOrgRepo } from "../../application/interface/repositories/IOrgRepo";
import { IInviteRepo } from "../../application/interface/repositories/IInviteRepo";
import { ITaskRepo } from "../../application/interface/repositories/ITaskRepo";
import { IProjectRepo } from "../../application/interface/repositories/IProjectRepo";
import { INotificationRepo } from "../../application/interface/repositories/INotificationRepo";
import { ISprintRepo } from "../../application/interface/repositories/ISprintRepo";
import { IInvoiceRepo } from "../../application/interface/repositories/IInvoiceRepo";

//Interfaces - Use Cases
import { ILoginUseCase } from "../../application/interface/useCases/ILoginUseCase";
import { IRegisterUseCase } from "../../application/interface/useCases/IRegisterUseCase";
import { IGoogleSignInUseCase } from "../../application/interface/useCases/IGoogleSignInUseCase";
import { ITokenRefreshUseCase } from "../../application/interface/useCases/ITokenRefreshUseCase";
import { ILogoutUseCase } from "../../application/interface/useCases/ILogoutUseCase";
import { IVerifyEmailUseCase } from "../../application/interface/useCases/IVerifyEmailUseCase";
import { IValidateTokenUseCase } from "../../application/interface/useCases/IValidateTokenUseCase";
import { IRegisterManagerUseCase } from "../../application/interface/useCases/IRegisterManagerUseCase";
import { ISendOtpUseCase } from "../../application/interface/useCases/ISendOtpUseCase";
import { IVerifyOtpUseCase } from "../../application/interface/useCases/IVerifyOtpUseCase";
import { ICompleteSignupUseCase } from "../../application/interface/useCases/ICompleteSignupUseCase";
import { IAcceptUseCase } from "../../application/interface/useCases/IAcceptUseCase";
import { IInviteMemberUseCase } from "../../application/interface/useCases/IInviteMemberUseCase";
import { IAdminInvoiceController } from "../../presentation/interfaces/controllers/IAdminInvoiceController";
import { IManagerInvoiceController } from "../../presentation/interfaces/controllers/IManagerInvoiceController";
import { IResetPasswordUseCase } from "../../application/interface/useCases/IResetPasswordUseCase";
import { IUserProfileUseCase } from "../../application/interface/useCases/IUserProfileUseCase";
import { IOrganizationManagementUseCase } from "../../application/interface/useCases/IOrganizationManagementUseCase";
import { ICreateSubscriptionUseCase } from "../../application/interface/useCases/ICreateSubscriptionUseCase";
import { IVerifyPaymentUseCase } from "../../application/interface/useCases/IVerifyPaymentUseCase";
import { IGetPlanUseCase } from "../../application/interface/useCases/IGetPlanUseCase";
import { ICreatePlanUseCase } from "../../application/interface/useCases/ICreatePlanUseCase";
import { IUpdatePlanUseCase } from "../../application/interface/useCases/IUpdatePlanUseCase";

import { IDeletePlanUseCase } from "../../application/interface/useCases/IDeletePlanUseCase";
import { IOrganizationQueryUseCase } from "../../application/interface/useCases/IOrganizationQueryUseCase";
import { IUserQueryUseCase } from "../../application/interface/useCases/IUserQueryUseCase";
import { IUserManagementUseCase } from "../../application/interface/useCases/IUserManagementUseCase";
import { IAdminStatsUseCase } from "../../application/interface/useCases/IAdminStatsUseCase";
import { IGetAdminInvoicesUseCase } from "../../application/interface/useCases/IGetAdminInvoicesUseCase";
import { IGetAdminAnalyticsUseCase } from "../../application/interface/useCases/IGetAdminAnalyticsUseCase";
import { IGetMemberAnalyticsUseCase } from "../../application/interface/useCases/IGetMemberAnalyticsUseCase";
import { IGetOrgInvoicesUseCase } from "../../application/interface/useCases/IGetOrgInvoicesUseCase";

import { ICreateProjectUseCase } from "../../application/interface/useCases/ICreateProjectUseCase";
import { IGetProjectUseCase } from "../../application/interface/useCases/IGetProjectUseCase";
import { IUpdateProjectUseCase } from "../../application/interface/useCases/IUpdateProjectUseCase";
import { IDeleteProjectUseCase } from "../../application/interface/useCases/IDeleteProjectUseCase";
import { IGetMemberProjectsUseCase } from "../../application/interface/useCases/IGetMemberProjectsUseCase";
import { IGetMemberTasksUseCase } from "../../application/interface/useCases/IGetMemberTasksUseCase";
import { IGetOrgTasksUseCase } from "../../application/interface/useCases/IGetOrgTasksUseCase";
import { IGetUserVelocityUseCase } from "../../application/interface/useCases/IGetUserVelocityUseCase";
import { IGetProjectByIdUseCase } from "../../application/interface/useCases/IGetProjectByIdUseCase";
import { IGetProjectVelocityUseCase } from "../../application/interface/useCases/IGetProjectVelocityUseCase";
import { IGetManagerAnalyticsUseCase } from "../../application/interface/useCases/IGetManagerAnalyticsUseCase";
import { ICreateTaskUseCase } from "../../application/interface/useCases/ICreateTaskUseCase";
import {
  IGetTaskUseCase,
  IGetTaskByIdUseCase,
} from "../../application/interface/useCases/IGetTaskUseCase";
import { IGetTaskHistoryUseCase } from "../../application/interface/useCases/IGetTaskHistoryUseCase";
import { GetTaskByIdUseCase } from "../../application/useCase/GetTaskByIdUseCase";
import { IUpdateTaskUseCase } from "../../application/interface/useCases/IUpdateTaskUseCase";
import { IDeleteTaskUseCase } from "../../application/interface/useCases/IDeleteTaskUseCase";
import { IGetProjectSprintsUseCase } from "../../application/interface/useCases/IGetProjectSprintsUseCase";
import { ICreateSprintUseCase } from "../../application/interface/useCases/ICreateSprintUseCase";
import { IUpdateSprintUseCase } from "../../application/interface/useCases/IUpdateSprintUseCase";
import { IDeleteSprintUseCase } from "../../application/interface/useCases/IDeleteSprintUseCase";

import { ICreateNotificationUseCase } from "../../application/interface/useCases/ICreateNotificationUseCase";

// Infrastructure Implementations - Services
import { Logger } from "../services/Logger";
import { BootstrapService } from "../services/BootstrapService";
import { HashService } from "../services/HashService";
import { JwtService } from "../services/JwtService";
import { GoogleAuthService } from "../services/GoogleAuthService";
import { EmailService } from "../services/EmailService";
import { OtpService } from "../services/OTPService";
import { JsonWebTokenProvider } from "../services/providers/JsonWebTokenProvider";
import { RedisCacheService } from "../services/RedisCacheService";
import { InMemoryCacheService } from "../services/InMemoryCacheService";
import { RazorpayService } from "../services/RazorpayService";
import { SocketService } from "../services/SocketService";
import { SocketServer } from "../../presentation/socket/SocketServer";
import { CloudinaryService } from "../services/CloudinaryService";
import { AnalyticsService } from "../services/AnalyticsService";
import { PasswordResetService } from "../services/PasswordResetService";
import { TaskDomainService } from "../../domain/services/TaskDomainService";
import { AuthValidationService } from "../services/AuthValidationService";
import { SecurityService } from "../services/SecurityService";
import { TimeTrackingService } from "../../domain/services/TimeTrackingService";
import { NotificationService } from "../../domain/services/NotificationService";
import { SprintDomainService } from "../../domain/services/SprintDomainService";

// Domain Interfaces - Providers
import { IJwtProvider } from "../../application/interface/services/IJwtProvider";

// Infrastructure Implementations - Repositories
import { UserRepo } from "../repositories/UserRepo";
import { OrgRepo } from "../repositories/OrgRepo";
import { InviteRepo } from "../repositories/InviteRepo";
import { PlanRepo } from "../repositories/PlanRepo";
import { SubscriptionRepo } from "../repositories/SubscriptionRepo";
import { TaskRepo } from "../repositories/TaskRepo";
import { ProjectRepo } from "../repositories/ProjectRepo";
import { NotificationRepo } from "../repositories/NotificationRepo";
import { SprintRepo } from "../repositories/SprintRepo";
import { ITaskHistoryRepo } from "../../application/interface/repositories/ITaskHistoryRepo";
import { TaskHistoryRepo } from "../repositories/TaskHistoryRepo";
import { InvoiceRepo } from "../repositories/InvoiceRepo";

// Application Use Cases
import { LoginUseCase } from "../../application/useCase/LoginUseCase";
import { RegisterUseCase } from "../../application/useCase/RegisterUseCase";
import { GoogleSignInUseCase } from "../../application/useCase/GoogleSignInUseCase";
import { TokenRefreshUseCase } from "../../application/useCase/TokenRefreshUseCase";
import { LogoutUseCase } from "../../application/useCase/LogoutUseCase";
import { VerifyEmailUseCase } from "../../application/useCase/VerifyEmailUseCase";
import { ValidateTokenUseCase } from "../../application/useCase/ValidateTokenUseCase";
import { RegisterManagerUseCase } from "../../application/useCase/RegisterManagerUseCase";
import { SendOtpUseCase } from "../../application/useCase/SendOtpUseCase";
import { VerifyOtpUseCase } from "../../application/useCase/VerifyOtpUseCase";
import { CompleteSignupUseCase } from "../../application/useCase/CompleteSignupUseCase";
import { AcceptUseCase } from "../../application/useCase/AcceptUseCase";
import { InviteMemberUseCase } from "../../application/useCase/InviteMemberUseCase";
import { ResetPasswordUseCase } from "../../application/useCase/ResetPasswordUseCase";
import { UserProfileUseCase } from "../../application/useCase/UserProfileUseCase";
import { OrganizationManagementUseCase } from "../../application/useCase/OrganizationManagementUseCase";
import { CreatePlanUseCase } from "../../application/useCase/CreatePlanUseCase";
import { GetPlansUseCase } from "../../application/useCase/GetPlansUseCase";
import { CreateSubscriptionUseCase } from "../../application/useCase/CreateSubscriptionUseCase";
import { VerifyPaymentUseCase } from "../../application/useCase/VerifyPaymentUseCase";
import { UpdatePlanUseCase } from "../../application/useCase/UpdatePlanUseCase";
import { DeletePlanUseCase } from "../../application/useCase/DeletePlanUseCase";
import { OrganizationQueryUseCase } from "../../application/useCase/OrganizationQueryUseCase";
import { UserQueryUseCase } from "../../application/useCase/UserQueryUseCase";
import { UserManagementUseCase } from "../../application/useCase/UserManagementUseCase";
import { AdminStatsUseCase } from "../../application/useCase/AdminStatsUseCase";
import { GetAdminInvoicesUseCase } from "../../application/useCase/GetAdminInvoicesUseCase";
import { GetAdminAnalyticsUseCase } from "../../application/useCase/GetAdminAnalyticsUseCase";
import { GetMemberAnalyticsUseCase } from "../../application/useCase/GetMemberAnalyticsUseCase";
import { GetOrgInvoicesUseCase } from "../../application/useCase/GetOrgInvoicesUseCase";

import { CreateTaskUseCase } from "../../application/useCase/CreateTaskUseCase";
import { GetTaskUseCase } from "../../application/useCase/GetTaskUseCase";
import { GetTaskHistoryUseCase } from "../../application/useCase/GetTaskHistoryUseCase";
import { UpdateTaskUseCase } from "../../application/useCase/UpdateTaskUseCase";
import { DeleteTaskUseCase } from "../../application/useCase/DeleteTaskUseCase";
import { CreateNotificationUseCase } from "../../application/useCase/CreateNotificationUseCase";
import { GetNotificationsUseCase } from "../../application/useCase/GetNotificationsUseCase";
import { MarkNotificationReadUseCase } from "../../application/useCase/MarkNotificationReadUseCase";
import { CreateSprintUseCase } from "../../application/useCase/CreateSprintUseCase";
import { UpdateSprintUseCase } from "../../application/useCase/UpdateSprintUseCase";
import { DeleteSprintUseCase } from "../../application/useCase/DeleteSprintUseCase";
import { GetProjectSprintsUseCase } from "../../application/useCase/GetProjectSprintsUseCase";
import { MarkAllNotificationsReadUseCase } from "../../application/useCase/MarkAllNotificationsReadUseCase";
import { IGetNotificationsUseCase } from "../../application/interface/useCases/IGetNotificationsUseCase";
import { IMarkNotificationReadUseCase } from "../../application/interface/useCases/IMarkNotificationReadUseCase";
import { IMarkAllNotificationsReadUseCase } from "../../application/interface/useCases/IMarkAllNotificationsReadUseCase";
import { IToggleTimerUseCase } from "../../application/interface/useCases/IToggleTimerUseCase";

import { CreateProjectUseCase } from "../../application/useCase/CreateProjectUseCase";
import { GetProjectUseCase } from "../../application/useCase/GetProjectUseCase";
import { GetProjectByIdUseCase } from "../../application/useCase/GetProjectByIdUseCase";
import { GetProjectVelocityUseCase } from "../../application/useCase/GetProjectVelocityUseCase";
import { UpdateProjectUseCase } from "../../application/useCase/UpdateProjectUseCase";
import { DeleteProjectUseCase } from "../../application/useCase/DeleteProjectUseCase";
import { GetMemberProjectsUseCase } from "../../application/useCase/GetMemberProjectsUseCase";
import { GetMemberTasksUseCase } from "../../application/useCase/GetMemberTasksUseCase";
import { GetOrgTasksUseCase } from "../../application/useCase/GetOrgTasksUseCase";
import { GetUserVelocityUseCase } from "../../application/useCase/GetUserVelocityUseCase";
import { ToggleTimerUseCase } from "../../application/useCase/ToggleTimerUseCase";

// Presentation Controllers
import { SessionController } from "../../presentation/controllers/auth/SessionController";
import { RegistrationController } from "../../presentation/controllers/auth/RegistrationController";
import { InviteController } from "../../presentation/controllers/auth/InviteController";
import { PasswordController } from "../../presentation/controllers/auth/PasswordController";

import { UserController } from "../../presentation/controllers/user/UserController";
import { ManagerController } from "../../presentation/controllers/manager/ManagerController";
import { PaymentController } from "../../presentation/controllers/PaymentController";
import { WebhookController } from "../../presentation/controllers/WebhookController";
import { AdminUserController } from "../../presentation/controllers/admin/AdminUserController";
import { AdminOrgController } from "../../presentation/controllers/admin/AdminOrgController";
import { AdminPlanController } from "../../presentation/controllers/admin/AdminPlanController";
import { OrganizationController } from "../../presentation/controllers/OrganizationController";
import { AdminInvoiceController } from "../../presentation/controllers/admin/AdminInvoiceController";
import { ManagerInvoiceController } from "../../presentation/controllers/manager/ManagerInvoiceController";

import { TaskController } from "../../presentation/controllers/manager/TaskController";
import { ProjectController } from "../../presentation/controllers/manager/ProjectController";
import { NotificationController } from "../../presentation/controllers/NotificationController";
import { ChatController } from "../../presentation/controllers/ChatController";
import { UploadController } from "../../presentation/controllers/UploadController";
import { SprintController } from "../../presentation/controllers/manager/SprintController";

// Chat Interfaces
import { IChatRepo } from "../../application/interface/repositories/IChatRepo";
import { ISendMessageUseCase } from "../../application/interface/useCases/ISendMessageUseCase";
import { IGetProjectMessagesUseCase } from "../../application/interface/useCases/IGetProjectMessagesUseCase";

// Chat Implementations
import { ChatRepo } from "../repositories/ChatRepo";
import { SendMessageUseCase } from "../../application/useCase/SendMessageUseCase";
import { GetProjectMessagesUseCase } from "../../application/useCase/GetProjectMessagesUseCase";
import { IEditMessageUseCase } from "../../application/interface/useCases/IEditMessageUseCase";
import { IDeleteMessageUseCase } from "../../application/interface/useCases/IDeleteMessageUseCase";
import { EditMessageUseCase } from "../../application/useCase/EditMessageUseCase";
import { DeleteMessageUseCase } from "../../application/useCase/DeleteMessageUseCase";
import { GetManagerAnalyticsUseCase } from "../../application/useCase/GetManagerAnalyticsUseCase";

/**
 * Service interface for async initialization/cleanup
 * Used to safely check for optional connect/init/disconnect/close methods
 */
interface IAsyncInitializable {
  connect?(): Promise<void>;
  init?(): Promise<void>;
  disconnect?(): Promise<void>;
  close?(): Promise<void>;
}

/**
 * DIContainer
 *
 * - Binds services, repositories, use-cases, and controllers.
 * - Provides an async init() method to initialize async services (e.g., Redis).
 * - Provides dispose() for tests/graceful shutdown.
 */
class DIContainer {
  private readonly _container: Container;
  private _initialized = false;

  constructor() {
    this._container = new Container();
    this._configureBindings();
  }

  /**
   * Bindings (unchanged)
   */
  private _configureBindings(): void {
    this._bindServices();
    this._bindRepositories();
    this._bindUseCases();
    this._bindControllers();
  }

  private _bindServices(): void {
    this._container.bind<AppConfig>(TYPES.AppConfig).toConstantValue(config);
    this._container.bind<ILogger>(TYPES.ILogger).to(Logger).inSingletonScope();
    this._container
      .bind(TYPES.IBootstrapService)
      .to(BootstrapService)
      .inSingletonScope();
    this._container
      .bind<IHashService>(TYPES.IHashService)
      .to(HashService)
      .inSingletonScope();
    this._container
      .bind<IJwtProvider>(TYPES.IJwtProvider)
      .to(JsonWebTokenProvider)
      .inSingletonScope();
    this._container
      .bind<IJwtService>(TYPES.IJwtService)
      .to(JwtService)
      .inSingletonScope();
    this._container
      .bind<IEmailService>(TYPES.IEmailService)
      .to(EmailService)
      .inSingletonScope();
    this._container
      .bind<IOtpService>(TYPES.IOtpService)
      .to(OtpService)
      .inSingletonScope();
    this._container
      .bind<IGoogleAuthService>(TYPES.IGoogleAuthService)
      .to(GoogleAuthService)
      .inSingletonScope();
    this._container
      .bind<IRazorpayService>(TYPES.IRazorpayService)
      .to(RazorpayService)
      .inSingletonScope();
    this._container
      .bind<ISocketService>(TYPES.ISocketService)
      .to(SocketService)
      .inSingletonScope();
    this._container
      .bind<SocketServer>(TYPES.SocketServer)
      .to(SocketServer)
      .inSingletonScope();

    this._container
      .bind<IFileService>(TYPES.IFileService)
      .to(CloudinaryService)
      .inSingletonScope();

    this._container
      .bind<IAnalyticsService>(TYPES.IAnalyticsService)
      .to(AnalyticsService)
      .inSingletonScope();

    this._container
      .bind<IPasswordResetService>(TYPES.IPasswordResetService)
      .to(PasswordResetService)
      .inSingletonScope();

    this._container
      .bind<ITaskDomainService>(TYPES.ITaskDomainService)
      .to(TaskDomainService)
      .inSingletonScope();

    this._container
      .bind<IAuthValidationService>(TYPES.IAuthValidationService)
      .to(AuthValidationService)
      .inSingletonScope();

    this._container
      .bind<ISecurityService>(TYPES.ISecurityService)
      .to(SecurityService)
      .inSingletonScope();

    this._container
      .bind<ITimeTrackingService>(TYPES.ITimeTrackingService)
      .to(TimeTrackingService)
      .inSingletonScope();

    this._container
      .bind<INotificationService>(TYPES.INotificationService)
      .to(NotificationService)
      .inSingletonScope();

    this._container
      .bind<ISprintDomainService>(TYPES.ISprintDomainService)
      .to(SprintDomainService)
      .inSingletonScope();

    const useRedis =
      String(process.env.USE_REDIS || "").toLowerCase() === "true";
    if (useRedis) {
      this._container
        .bind<ICacheService>(TYPES.ICacheService)
        .to(RedisCacheService)
        .inSingletonScope();
    } else {
      this._container
        .bind<ICacheService>(TYPES.ICacheService)
        .to(InMemoryCacheService)
        .inSingletonScope();
    }
  }

  private _bindRepositories(): void {
    this._container
      .bind<IUserRepo>(TYPES.IUserRepo)
      .to(UserRepo)
      .inSingletonScope();
    this._container
      .bind<IOrgRepo>(TYPES.IOrgRepo)
      .to(OrgRepo)
      .inSingletonScope();
    this._container
      .bind<IInviteRepo>(TYPES.IInviteRepo)
      .to(InviteRepo)
      .inSingletonScope();
    this._container
      .bind<IPlanRepo>(TYPES.IPlanRepo)
      .to(PlanRepo)
      .inSingletonScope();
    this._container
      .bind<ISubscriptionRepo>(TYPES.ISubscriptionRepo)
      .to(SubscriptionRepo)
      .inSingletonScope();
    this._container
      .bind<ITaskRepo>(TYPES.ITaskRepo)
      .to(TaskRepo)
      .inSingletonScope();
    this._container
      .bind<IProjectRepo>(TYPES.IProjectRepo)
      .to(ProjectRepo)
      .inSingletonScope();

    this._container
      .bind<INotificationRepo>(TYPES.INotificationRepo)
      .to(NotificationRepo)
      .inSingletonScope();

    this._container
      .bind<IChatRepo>(TYPES.IChatRepo)
      .to(ChatRepo)
      .inSingletonScope();

    this._container
      .bind<ISprintRepo>(TYPES.ISprintRepo)
      .to(SprintRepo)
      .inSingletonScope();
    this._container
      .bind<ITaskHistoryRepo>(TYPES.ITaskHistoryRepo)
      .to(TaskHistoryRepo)
      .inSingletonScope();

    this._container
      .bind<IInvoiceRepo>(TYPES.IInvoiceRepo)
      .to(InvoiceRepo)
      .inSingletonScope();
  }

  private _bindUseCases(): void {
    this._container
      .bind<ILoginUseCase>(TYPES.ILoginUseCase)
      .to(LoginUseCase)
      .inTransientScope();
    this._container
      .bind<IRegisterUseCase>(TYPES.IRegisterUseCase)
      .to(RegisterUseCase)
      .inTransientScope();
    this._container
      .bind<IGoogleSignInUseCase>(TYPES.IGoogleSignInUseCase)
      .to(GoogleSignInUseCase)
      .inTransientScope();
    this._container
      .bind<ITokenRefreshUseCase>(TYPES.ITokenRefreshUseCase)
      .to(TokenRefreshUseCase)
      .inTransientScope();
    this._container
      .bind<ILogoutUseCase>(TYPES.ILogoutUseCase)
      .to(LogoutUseCase)
      .inTransientScope();
    this._container
      .bind<IVerifyEmailUseCase>(TYPES.IVerifyEmailUseCase)
      .to(VerifyEmailUseCase)
      .inTransientScope();
    this._container
      .bind<IValidateTokenUseCase>(TYPES.IValidateTokenUseCase)
      .to(ValidateTokenUseCase)
      .inTransientScope();
    this._container
      .bind<IRegisterManagerUseCase>(TYPES.IRegisterManagerUseCase)
      .to(RegisterManagerUseCase)
      .inTransientScope();
    this._container
      .bind<ISendOtpUseCase>(TYPES.ISendOtpUseCase)
      .to(SendOtpUseCase)
      .inTransientScope();
    this._container
      .bind<IVerifyOtpUseCase>(TYPES.IVerifyOtpUseCase)
      .to(VerifyOtpUseCase)
      .inTransientScope();
    this._container
      .bind<ICompleteSignupUseCase>(TYPES.ICompleteSignupUseCase)
      .to(CompleteSignupUseCase)
      .inTransientScope();
    this._container
      .bind<IAcceptUseCase>(TYPES.IAcceptUseCase)
      .to(AcceptUseCase)
      .inTransientScope();
    this._container
      .bind<IInviteMemberUseCase>(TYPES.IInviteMemberUseCase)
      .to(InviteMemberUseCase)
      .inTransientScope();
    this._container
      .bind<IResetPasswordUseCase>(TYPES.IResetPasswordUseCase)
      .to(ResetPasswordUseCase)
      .inTransientScope();
    this._container
      .bind<IUserProfileUseCase>(TYPES.IUserProfileUseCase)
      .to(UserProfileUseCase)
      .inTransientScope();
    this._container
      .bind<IOrganizationManagementUseCase>(
        TYPES.IOrganizationManagementUseCase,
      )
      .to(OrganizationManagementUseCase)
      .inTransientScope();
    this._container
      .bind<ICreatePlanUseCase>(TYPES.ICreatePlanUseCase)
      .to(CreatePlanUseCase)
      .inTransientScope();
    this._container
      .bind<IGetPlanUseCase>(TYPES.IGetPlanUseCase)
      .to(GetPlansUseCase)
      .inTransientScope();
    this._container
      .bind<ICreateSubscriptionUseCase>(TYPES.ICreateSubscriptionUseCase)
      .to(CreateSubscriptionUseCase)
      .inTransientScope();
    this._container
      .bind<IVerifyPaymentUseCase>(TYPES.IVerifyPaymentUseCase)
      .to(VerifyPaymentUseCase)
      .inTransientScope();
    this._container
      .bind<IUpdatePlanUseCase>(TYPES.IUpdatePlanUseCase)
      .to(UpdatePlanUseCase)
      .inTransientScope();
    this._container
      .bind<IDeletePlanUseCase>(TYPES.IDeletePlanUseCase)
      .to(DeletePlanUseCase)
      .inTransientScope();
    this._container
      .bind<IOrganizationQueryUseCase>(TYPES.IOrganizationQueryUseCase)
      .to(OrganizationQueryUseCase)
      .inTransientScope();
    this._container
      .bind<IUserQueryUseCase>(TYPES.IUserQueryUseCase)
      .to(UserQueryUseCase)
      .inTransientScope();
    this._container
      .bind<IUserManagementUseCase>(TYPES.IUserManagementUseCase)
      .to(UserManagementUseCase)
      .inTransientScope();
    this._container
      .bind<IAdminStatsUseCase>(TYPES.IAdminStatsUseCase)
      .to(AdminStatsUseCase)
      .inTransientScope();

    this._container
      .bind<IGetAdminAnalyticsUseCase>(TYPES.IGetAdminAnalyticsUseCase)
      .to(GetAdminAnalyticsUseCase)
      .inTransientScope();

    this._container
      .bind<IGetAdminInvoicesUseCase>(TYPES.IGetAdminInvoicesUseCase)
      .to(GetAdminInvoicesUseCase)
      .inTransientScope();

    this._container
      .bind<IGetOrgInvoicesUseCase>(TYPES.IGetOrgInvoicesUseCase)
      .to(GetOrgInvoicesUseCase)
      .inTransientScope();
    this._container
      .bind<ICreateTaskUseCase>(TYPES.ICreateTaskUseCase)
      .to(CreateTaskUseCase)
      .inTransientScope();
    this._container
      .bind<IGetTaskUseCase>(TYPES.IGetTaskUseCase)
      .to(GetTaskUseCase)
      .inSingletonScope();
    this._container
      .bind<IGetTaskByIdUseCase>(TYPES.IGetTaskByIdUseCase)
      .to(GetTaskByIdUseCase)
      .inSingletonScope();
    this._container
      .bind<IUpdateTaskUseCase>(TYPES.IUpdateTaskUseCase)
      .to(UpdateTaskUseCase)
      .inTransientScope();
    this._container
      .bind<IDeleteTaskUseCase>(TYPES.IDeleteTaskUseCase)
      .to(DeleteTaskUseCase)
      .inTransientScope();

    this._container
      .bind<IToggleTimerUseCase>(TYPES.IToggleTimerUseCase)
      .to(ToggleTimerUseCase)
      .inTransientScope();
    this._container
      .bind<ICreateProjectUseCase>(TYPES.ICreateProjectUseCase)
      .to(CreateProjectUseCase)
      .inTransientScope();
    this._container
      .bind<IGetProjectUseCase>(TYPES.IGetProjectUseCase)
      .to(GetProjectUseCase)
      .inTransientScope();
    this._container
      .bind<IGetProjectByIdUseCase>(TYPES.IGetProjectByIdUseCase)
      .to(GetProjectByIdUseCase)
      .inTransientScope();

    this._container
      .bind<IGetProjectVelocityUseCase>(TYPES.IGetProjectVelocityUseCase)
      .to(GetProjectVelocityUseCase)
      .inTransientScope();

    this._container
      .bind<IGetManagerAnalyticsUseCase>(TYPES.IGetManagerAnalyticsUseCase)
      .to(GetManagerAnalyticsUseCase)
      .inTransientScope();

    this._container
      .bind<IUpdateProjectUseCase>(TYPES.IUpdateProjectUseCase)
      .to(UpdateProjectUseCase)
      .inTransientScope();

    this._container
      .bind<IDeleteProjectUseCase>(TYPES.IDeleteProjectUseCase)
      .to(DeleteProjectUseCase)
      .inTransientScope();

    this._container
      .bind<IGetMemberAnalyticsUseCase>(TYPES.IGetMemberAnalyticsUseCase)
      .to(GetMemberAnalyticsUseCase)
      .inTransientScope();

    this._container
      .bind<IGetMemberProjectsUseCase>(TYPES.IGetMemberProjectsUseCase)
      .to(GetMemberProjectsUseCase)
      .inTransientScope();

    this._container
      .bind<IGetMemberTasksUseCase>(TYPES.IGetMemberTasksUseCase)
      .to(GetMemberTasksUseCase)
      .inTransientScope();

    this._container
      .bind<IGetOrgTasksUseCase>(TYPES.IGetOrgTasksUseCase)
      .to(GetOrgTasksUseCase)
      .inTransientScope();

    this._container
      .bind<IGetUserVelocityUseCase>(TYPES.IGetUserVelocityUseCase)
      .to(GetUserVelocityUseCase)
      .inTransientScope();

    this._container
      .bind<ICreateNotificationUseCase>(TYPES.ICreateNotificationUseCase)
      .to(CreateNotificationUseCase)
      .inTransientScope();

    this._container
      .bind<IGetNotificationsUseCase>(TYPES.IGetNotificationsUseCase)
      .to(GetNotificationsUseCase)
      .inTransientScope();

    this._container
      .bind<IMarkNotificationReadUseCase>(TYPES.IMarkNotificationReadUseCase)
      .to(MarkNotificationReadUseCase)
      .inTransientScope();

    this._container
      .bind<IMarkAllNotificationsReadUseCase>(
        TYPES.IMarkAllNotificationsReadUseCase,
      )
      .to(MarkAllNotificationsReadUseCase)
      .inTransientScope();

    this._container
      .bind<ISendMessageUseCase>(TYPES.ISendMessageUseCase)
      .to(SendMessageUseCase)
      .inTransientScope();

    this._container
      .bind<IGetProjectMessagesUseCase>(TYPES.IGetProjectMessagesUseCase)
      .to(GetProjectMessagesUseCase)
      .inTransientScope();

    this._container
      .bind<IEditMessageUseCase>(TYPES.IEditMessageUseCase)
      .to(EditMessageUseCase)
      .inTransientScope();

    this._container
      .bind<IDeleteMessageUseCase>(TYPES.IDeleteMessageUseCase)
      .to(DeleteMessageUseCase)
      .inTransientScope();

    this._container
      .bind<ICreateSprintUseCase>(TYPES.ICreateSprintUseCase)
      .to(CreateSprintUseCase)
      .inTransientScope();

    this._container
      .bind<IUpdateSprintUseCase>(TYPES.IUpdateSprintUseCase)
      .to(UpdateSprintUseCase)
      .inTransientScope();

    this._container
      .bind<IDeleteSprintUseCase>(TYPES.IDeleteSprintUseCase)
      .to(DeleteSprintUseCase)
      .inTransientScope();

    this._container
      .bind<IGetProjectSprintsUseCase>(TYPES.IGetProjectSprintsUseCase)
      .to(GetProjectSprintsUseCase)
      .inTransientScope();

    this._container
      .bind<IGetTaskHistoryUseCase>(TYPES.IGetTaskHistoryUseCase)
      .to(GetTaskHistoryUseCase)
      .inTransientScope();
  }

  private _bindControllers(): void {
    /*
    this._container
      .bind<AuthController>(TYPES.AuthController)
      .to(AuthController)
      .inSingletonScope();
    */
    this._container
      .bind<SessionController>(TYPES.SessionController)
      .to(SessionController)
      .inSingletonScope();
    this._container
      .bind<RegistrationController>(TYPES.RegistrationController)
      .to(RegistrationController)
      .inSingletonScope();
    this._container
      .bind<InviteController>(TYPES.InviteController)
      .to(InviteController)
      .inSingletonScope();
    this._container
      .bind<PasswordController>(TYPES.PasswordController)
      .to(PasswordController)
      .inSingletonScope();

    this._container
      .bind<AdminUserController>(TYPES.AdminUserController)
      .to(AdminUserController)
      .inSingletonScope();
    this._container
      .bind<AdminOrgController>(TYPES.AdminOrgController)
      .to(AdminOrgController)
      .inSingletonScope();
    this._container
      .bind<OrganizationController>(TYPES.OrganizationController)
      .to(OrganizationController)
      .inSingletonScope();
    this._container
      .bind<AdminPlanController>(TYPES.AdminPlanController)
      .to(AdminPlanController)
      .inSingletonScope();

    this._container
      .bind<IAdminInvoiceController>(TYPES.AdminInvoiceController)
      .to(AdminInvoiceController)
      .inSingletonScope();

    this._container
      .bind<IManagerInvoiceController>(TYPES.ManagerInvoiceController)
      .to(ManagerInvoiceController)
      .inSingletonScope();
    this._container
      .bind<UserController>(TYPES.UserController)
      .to(UserController)
      .inSingletonScope();
    this._container
      .bind<ManagerController>(TYPES.ManagerController)
      .to(ManagerController)
      .inSingletonScope();
    this._container
      .bind<PaymentController>(TYPES.PaymentController)
      .to(PaymentController)
      .inSingletonScope();
    this._container
      .bind<WebhookController>(TYPES.WebhookController)
      .to(WebhookController)
      .inSingletonScope();
    this._container
      .bind<TaskController>(TYPES.TaskController)
      .to(TaskController)
      .inSingletonScope();
    this._container
      .bind<ProjectController>(TYPES.ProjectController)
      .to(ProjectController)
      .inSingletonScope();

    this._container
      .bind<NotificationController>(TYPES.NotificationController)
      .to(NotificationController)
      .inSingletonScope();

    this._container
      .bind<ChatController>(TYPES.ChatController)
      .to(ChatController)
      .inSingletonScope();

    this._container
      .bind<UploadController>(TYPES.UploadController)
      .to(UploadController)
      .inSingletonScope();

    this._container
      .bind<SprintController>(TYPES.SprintController)
      .to(SprintController)
      .inSingletonScope();
  }

  /**
   * Initialize async services if required.
   * - Ensures initialization runs only once.
   * - Looks for services that expose an async `connect()` or `init()` method and invokes it.
   */
  public async init(): Promise<void> {
    if (this._initialized) return;
    this._initialized = true;

    // Try to initialize cache service if it has async startup
    try {
      if (this._container.isBound(TYPES.ICacheService)) {
        const cache = this._container.get<ICacheService>(
          TYPES.ICacheService,
        ) as IAsyncInitializable;
        if (cache && typeof cache.connect === "function") {
          // If RedisCacheService provides an async connect(), await it.
          await cache.connect();
        }
      }
    } catch (err) {
      console.error("Cache initialization failed:", err);
    }
  }

  /**
   * Disposes the container and its singletons.
   * Useful for tests or clean process termination.
   */
  public async dispose(): Promise<void> {
    // Graceful shutdown logic: Inversify doesn't provide a direct way to get all singletons easily without internal access
    // We'll rely on the process termination for now, or the user can manually close specific services if needed.
    // This avoids non-existent property errors during build.
  }

  public get container(): Container {
    return this._container;
  }

  public get<T>(type: symbol): T {
    return this._container.get<T>(type);
  }

  public isBound(type: symbol): boolean {
    return this._container.isBound(type);
  }
}

export const diContainer = new DIContainer();
export const container = diContainer.container;
