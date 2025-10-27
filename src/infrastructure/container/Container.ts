// src/infrastructure/container/Container.ts
import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./types";

// Domain Interfaces - Services
import { ILogger } from "../../domain/interfaces/services/ILogger";
import { IHashService } from "../../domain/interfaces/services/IHashService";
import { IJwtService } from "../../domain/interfaces/services/IJwtService";
import { IEmailService } from "../../domain/interfaces/services/IEmailService";
import { IOtpService } from "../../domain/interfaces/services/IOtpService";
import { ICacheService } from "../../domain/interfaces/services/ICacheService";

// Domain Interfaces - Repositories
import { IUserRepo } from "../../domain/interfaces/IUserRepo";
import { IOrgRepo } from "../../domain/interfaces/IOrgRepo";
import { IInviteRepo } from "../../domain/interfaces/IInviteRepo";

// Domain Interfaces - Use Cases
import { IAuthUseCases } from "../../domain/interfaces/useCases/IAuthUseCases";
import { IRegisterManagerUseCase } from "../../domain/interfaces/useCases/IRegisterManagerUseCase";
import { ISendOtpUseCase } from "../../domain/interfaces/useCases/ISendOtpUseCase";
import { IVerifyOtpUseCase } from "../../domain/interfaces/useCases/IVerifyOtpUseCase";
import { ICompleteSignupUseCase } from "../../domain/interfaces/useCases/ICompleteSignupUseCase";
import { IAcceptUseCase } from "../../domain/interfaces/useCases/IAcceptUseCase";
import { IInviteMemberUseCase } from "../../domain/interfaces/useCases/IInviteMemberUseCase";
import { IResetPasswordUseCase } from "../../domain/interfaces/useCases/IResetPasswordUseCase";
import { IUserProfileUseCase } from "../../domain/interfaces/useCases/IUserProfileUseCase";

// Infrastructure Implementations - Services
import { Logger } from "../services/Logger";
import { HashService } from "../services/HashService";
import { JwtService } from "../services/JwtService";
import { EmailService } from "../services/EmailService";
import { OtpService } from "../services/OTPService";
import { JsonWebTokenProvider } from "../services/providers/JsonWebTokenProvider";
import { RedisCacheService } from "../services/RedisCacheService";
import { InMemoryCacheService } from "../services/InMemoryCacheService";

// Domain Interfaces - Providers
import { IJwtProvider } from "../../domain/interfaces/services/IJwtProvider";

// Infrastructure Implementations - Repositories
import { UserRepo } from "../repositories/UserRepo";
import { OrgRepo } from "../repositories/OrgRepo";
import { InviteRepo } from "../repositories/InviteRepo";

// Application Use Cases
import { AuthUseCases } from "../../application/useCase/AuthUseCase";
import { RegisterManagerUseCase } from "../../application/useCase/RegisterManagerUseCase";
import { SendOtpUseCase } from "../../application/useCase/SendOtpUseCase";
import { VerifyOtpUseCase } from "../../application/useCase/VerifyOtpUseCase";
import { CompleteSignupUseCase } from "../../application/useCase/CompleteSignupUseCase";
import { AcceptUseCase } from "../../application/useCase/AcceptUseCase";
import { InviteMemberUseCase } from "../../application/useCase/InviteMemberUseCase";
import { ResetPasswordUseCase } from "../../application/useCase/ResetPasswordUseCase";
import { UserProfileUseCase } from "../../application/useCase/UserProfileUseCase";

// Presentation Controllers
import { AuthController } from "../../presentation/controllers/AuthController";
import { AdminController } from "../../presentation/controllers/AdminController";
import { UserController } from "../../presentation/controllers/UserController";
import { ManagerController } from "../../presentation/controllers/ManagerController";

class DIContainer {
  private readonly _container: Container;

  constructor() {
    this._container = new Container();
    this._configureBindings();
  }

  /**
   * Services -> Repositories -> Use Cases -> Controllers
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
  }

  private _bindUseCases(): void {
    this._container
      .bind<IAuthUseCases>(TYPES.IAuthUseCases)
      .to(AuthUseCases)
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

// Export singleton container instance
export const diContainer = new DIContainer();
export const container = diContainer.container;
