// src/infrastructure/container/Container.ts
import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./types";

//Interfaces - Services
import { ILogger } from "../interface/services/ILogger";
import { IHashService } from "../interface/services/IHashService";
import { IJwtService } from "../interface/services/IJwtService";
import { IEmailService } from "../interface/services/IEmailService";
import { IOtpService } from "../interface/services/IOtpService";
import { ICacheService } from "../interface/services/ICacheService";
import { IGoogleAuthService } from "../interface/services/IGoogleAuthService ";
import { IRazorpayService } from "../interface/services/IRazorpayService";
import { IPlanRepo } from "../interface/repositories/IPlanRepo";
import { ISubscriptionRepo } from "../interface/repositories/ISubscriptionRepo";
import { ISocketService } from "../interface/services/ISocketService";

//Interfaces - Repositories
import { IUserRepo } from "../interface/repositories/IUserRepo";
import { IOrgRepo } from "../interface/repositories/IOrgRepo";
import { IInviteRepo } from "../interface/repositories/IInviteRepo";
import { ITaskRepo } from "../interface/repositories/ITaskRepo";
import { IProjectRepo } from "../interface/repositories/IProjectRepo";
import { INotificationRepo } from "../interface/repositories/INotificationRepo";

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

import { ICreateProjectUseCase } from "../../application/interface/useCases/ICreateProjectUseCase";
import { IGetProjectUseCase } from "../../application/interface/useCases/IGetProjectUseCase";
import { IUpdateProjectUseCase } from "../../application/interface/useCases/IUpdateProjectUseCase";
import { IDeleteProjectUseCase } from "../../application/interface/useCases/IDeleteProjectUseCase";
import { IGetMemberProjectsUseCase } from "../../application/interface/useCases/IGetMemberProjectsUseCase";
import { IGetMemberTasksUseCase } from "../../application/interface/useCases/IGetMemberTasksUseCase";
import { IGetProjectByIdUseCase } from "../../application/interface/useCases/IGetProjectByIdUseCase";

import { ICreateTaskUseCase } from "../../application/interface/useCases/ICreateTaskUseCase";
import { IGetTaskUseCase } from "../../application/interface/useCases/IGetTaskUseCase";
import { IUpdateTaskUseCase } from "../../application/interface/useCases/IUpdateTaskUseCase";
import { IDeleteTaskUseCase } from "../../application/interface/useCases/IDeleteTaskUseCase";

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

// Domain Interfaces - Providers
import { IJwtProvider } from "../interface/services/IJwtProvider";

// Infrastructure Implementations - Repositories
import { UserRepo } from "../repositories/UserRepo";
import { OrgRepo } from "../repositories/OrgRepo";
import { InviteRepo } from "../repositories/InviteRepo";
import { PlanRepo } from "../repositories/PlanRepo";
import { SubscriptionRepo } from "../repositories/SubscriptionRepo";
import { TaskRepo } from "../repositories/TaskRepo";
import { ProjectRepo } from "../repositories/ProjectRepo";
import { NotificationRepo } from "../repositories/NotificationRepo";

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

import { CreateTaskUseCase } from "../../application/useCase/CreateTaskUseCase";
import { GetTaskUseCase } from "../../application/useCase/GetTaskUseCase";
import { UpdateTaskUseCase } from "../../application/useCase/UpdateTaskUseCase";
import { DeleteTaskUseCase } from "../../application/useCase/DeleteTaskUseCase";
import { CreateNotificationUseCase } from "../../application/useCase/CreateNotificationUseCase";
import { GetNotificationsUseCase } from "../../application/useCase/GetNotificationsUseCase";
import { MarkNotificationReadUseCase } from "../../application/useCase/MarkNotificationReadUseCase";
import { MarkAllNotificationsReadUseCase } from "../../application/useCase/MarkAllNotificationsReadUseCase";
import { IGetNotificationsUseCase } from "../../application/interface/useCases/IGetNotificationsUseCase";
import { IMarkNotificationReadUseCase } from "../../application/interface/useCases/IMarkNotificationReadUseCase";
import { IMarkAllNotificationsReadUseCase } from "../../application/interface/useCases/IMarkAllNotificationsReadUseCase";

import { CreateProjectUseCase } from "../../application/useCase/CreateProjectUseCase";
import { GetProjectUseCase } from "../../application/useCase/GetProjectUseCase";
import { GetProjectByIdUseCase } from "../../application/useCase/GetProjectByIdUseCase";
import { UpdateProjectUseCase } from "../../application/useCase/UpdateProjectUseCase";
import { DeleteProjectUseCase } from "../../application/useCase/DeleteProjectUseCase";
import { GetMemberProjectsUseCase } from "../../application/useCase/GetMemberProjectsUseCase";
import { GetMemberTasksUseCase } from "../../application/useCase/GetMemberTasksUseCase";

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

import { TaskController } from "../../presentation/controllers/manager/TaskController";
import { ProjectController } from "../../presentation/controllers/manager/ProjectController";
import { NotificationController } from "../../presentation/controllers/NotificationController";

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
 * Logger-like interface for fallback logging
 */
interface ILoggerLike {
  warn?(message: string, error?: unknown): void;
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
      .bind<ICreateTaskUseCase>(TYPES.ICreateTaskUseCase)
      .to(CreateTaskUseCase)
      .inTransientScope();
    this._container
      .bind<IGetTaskUseCase>(TYPES.IGetTaskUseCase)
      .to(GetTaskUseCase)
      .inTransientScope();
    this._container
      .bind<IUpdateTaskUseCase>(TYPES.IUpdateTaskUseCase)
      .to(UpdateTaskUseCase)
      .inTransientScope();
    this._container
      .bind<IDeleteTaskUseCase>(TYPES.IDeleteTaskUseCase)
      .to(DeleteTaskUseCase)
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
      .bind<IUpdateProjectUseCase>(TYPES.IUpdateProjectUseCase)
      .to(UpdateProjectUseCase)
      .inTransientScope();
    this._container
      .bind<IDeleteProjectUseCase>(TYPES.IDeleteProjectUseCase)
      .to(DeleteProjectUseCase)
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
        } else if (cache && typeof cache.init === "function") {
          await cache.init();
        }
      }
    } catch (err) {
      // If init fails, rethrow so caller can decide to fail-fast or continue.
      const logger = this._container.isBound(TYPES.ILogger)
        ? (this._container.get<ILogger>(TYPES.ILogger) as ILoggerLike)
        : console;
      logger?.warn?.("Cache service initialization failed", err);
      throw err;
    }
  }

  /**
   * Dispose / cleanup helpers (useful in tests or graceful shutdown)
   */
  public async dispose(): Promise<void> {
    try {
      // Try to close cache connections if present
      if (this._container.isBound(TYPES.ICacheService)) {
        const cache = this._container.get<ICacheService>(
          TYPES.ICacheService,
        ) as IAsyncInitializable;
        if (cache && typeof cache.disconnect === "function")
          await cache.disconnect();
        if (cache && typeof cache.close === "function") await cache.close();
      }
    } catch (err) {
      // best-effort
      const logger = this._container.isBound(TYPES.ILogger)
        ? (this._container.get<ILogger>(TYPES.ILogger) as ILoggerLike)
        : console;
      logger?.warn?.("Error during container dispose", err);
    }
  }

  public get container(): Container {
    return this._container;
  }

  public get<T>(serviceIdentifier: symbol): T {
    return this._container.get<T>(serviceIdentifier);
  }

  public isBound(serviceIdentifier: symbol): boolean {
    return this._container.isBound(serviceIdentifier);
  }

  public unbind(serviceIdentifier: symbol): void {
    this._container.unbind(serviceIdentifier);
  }

  public rebind<T>(serviceIdentifier: symbol) {
    return this._container.rebind<T>(serviceIdentifier);
  }
}

// Export container instance (constructed eagerly but init() must be called before use of async deps)
export const diContainer = new DIContainer();
export const container = diContainer.container;
