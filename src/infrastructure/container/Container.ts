// src/infrastructure/container/Container.ts
import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./types";

// Domain Interfaces - Services
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

// Domain Interfaces - Repositories
import { IUserRepo } from "../interface/repositories/IUserRepo";
import { IOrgRepo } from "../interface/repositories/IOrgRepo";
import { IInviteRepo } from "../interface/repositories/IInviteRepo";

// Domain Interfaces - Use Cases
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

// Domain Interfaces - Providers
import { IJwtProvider } from "../interface/services/IJwtProvider";

// Infrastructure Implementations - Repositories
import { UserRepo } from "../repositories/UserRepo";
import { OrgRepo } from "../repositories/OrgRepo";
import { InviteRepo } from "../repositories/InviteRepo";
import { PlanRepo } from "../repositories/PlanRepo";
import { SubscriptionRepo } from "../repositories/SubscriptionRepo";

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

// Presentation Controllers
import { AuthController } from "../../presentation/controllers/AuthController";
import { AdminController } from "../../presentation/controllers/AdminController";
import { UserController } from "../../presentation/controllers/UserController";
import { ManagerController } from "../../presentation/controllers/ManagerController";
import { PaymentController } from "../../presentation/controllers/PaymentController";
import { WebhookController } from "../../presentation/controllers/WebhookController";

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
  }

  private _bindControllers(): void {
    this._container
      .bind<AuthController>(TYPES.AuthController)
      .to(AuthController)
      .inSingletonScope();
    this._container
      .bind<AdminController>(TYPES.AdminController)
      .to(AdminController)
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
