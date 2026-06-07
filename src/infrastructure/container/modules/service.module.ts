import { ContainerModule, interfaces } from "inversify";
import "reflect-metadata";
import { AppConfig, config } from "../../../config/AppConfig";
import { TYPES } from "../types";

//Interfaces - Services
import { ILogger } from "../../../application/interface/services/ILogger";
import { IHashService } from "../../../application/interface/services/IHashService";
import { IJwtService } from "../../../application/interface/services/IJwtService";
import { IEmailService } from "../../../application/interface/services/IEmailService";
import { IOtpService } from "../../../application/interface/services/IOtpService";
import { ICacheService } from "../../../application/interface/services/ICacheService";
import { IGoogleAuthService } from "../../../application/interface/services/IGoogleAuthService";
import { IRazorpayService } from "../../../application/interface/services/IRazorpayService";
import { ISocketService } from "../../../application/interface/services/ISocketService";
import { IFileService } from "../../../application/interface/services/IFileService";
import { IAnalyticsService } from "../../../application/interface/services/IAnalyticsService";
import { IPasswordResetService } from "../../../application/interface/services/IPasswordResetService";
import { ITaskDomainService } from "../../../domain/interface/services/ITaskDomainService";
import { IAuthValidationService } from "../../../application/interface/services/IAuthValidationService";
import { ISecurityService } from "../../../application/interface/services/ISecurityService";
import { ITimeTrackingService } from "../../../domain/interface/services/ITimeTrackingService";
import { INotificationService } from "../../../domain/interface/services/INotificationService";
import { ISprintDomainService } from "../../../domain/interface/services/ISprintDomainService";
import { IEventDispatcher } from "../../../application/interface/services/IEventDispatcher";

//Interfaces - Repositories

//Interfaces - Use Cases

// Infrastructure Implementations - Services
import { Logger } from "../../services/Logger";
import { BootstrapService } from "../../services/BootstrapService";
import { HashService } from "../../services/HashService";
import { JwtService } from "../../services/JwtService";
import { GoogleAuthService } from "../../services/GoogleAuthService";
import { EmailService } from "../../services/EmailService";
import { OtpService } from "../../services/OTPService";
import { JsonWebTokenProvider } from "../../services/providers/JsonWebTokenProvider";
import { RedisCacheService } from "../../services/RedisCacheService";
import { InMemoryCacheService } from "../../services/InMemoryCacheService";
import { RazorpayService } from "../../services/RazorpayService";
import { SocketService } from "../../services/SocketService";
import { SocketServer } from "../../../presentation/socket/SocketServer";
import { CloudinaryService } from "../../services/CloudinaryService";
import { AnalyticsService } from "../../services/AnalyticsService";
import { PasswordResetService } from "../../services/PasswordResetService";
import { TaskDomainService } from "../../../domain/services/TaskDomainService";
import { AuthValidationService } from "../../services/AuthValidationService";
import { SecurityService } from "../../services/SecurityService";
import { TimeTrackingService } from "../../../domain/services/TimeTrackingService";
import { NotificationService } from "../../services/NotificationService";
import { SprintDomainService } from "../../../domain/services/SprintDomainService";
import { EventDispatcher } from "../../services/EventDispatcher";

// Domain Interfaces - Providers
import { IJwtProvider } from "../../../application/interface/services/IJwtProvider";
import { TaskEventSubscriber } from "../../subscribers/TaskEventSubscriber";
import { ProjectEventSubscriber } from "../../subscribers/ProjectEventSubscriber";
import { SprintEventSubscriber } from "../../subscribers/SprintEventSubscriber";
import { ChatEventSubscriber } from "../../subscribers/ChatEventSubscriber";
import { MeetingEventSubscriber } from "../../subscribers/MeetingEventSubscriber";

// Infrastructure Implementations - Repositories

// Application Use Cases

// Presentation Controllers

// Chat Interfaces
// Chat Implementations

export const serviceModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<AppConfig>(TYPES.AppConfig).toConstantValue(config);
  bind<ILogger>(TYPES.ILogger).to(Logger).inSingletonScope();
  bind(TYPES.IBootstrapService).to(BootstrapService).inSingletonScope();
  bind<IHashService>(TYPES.IHashService).to(HashService).inSingletonScope();
  bind<IJwtProvider>(TYPES.IJwtProvider)
    .to(JsonWebTokenProvider)
    .inSingletonScope();
  bind<IJwtService>(TYPES.IJwtService).to(JwtService).inSingletonScope();
  bind<IEmailService>(TYPES.IEmailService).to(EmailService).inSingletonScope();
  bind<IOtpService>(TYPES.IOtpService).to(OtpService).inSingletonScope();
  bind<IGoogleAuthService>(TYPES.IGoogleAuthService)
    .to(GoogleAuthService)
    .inSingletonScope();
  bind<IRazorpayService>(TYPES.IRazorpayService)
    .to(RazorpayService)
    .inSingletonScope();
  bind<ISocketService>(TYPES.ISocketService)
    .to(SocketService)
    .inSingletonScope();
  bind<SocketServer>(TYPES.SocketServer).to(SocketServer).inSingletonScope();

  bind<IFileService>(TYPES.IFileService)
    .to(CloudinaryService)
    .inSingletonScope();

  bind<IAnalyticsService>(TYPES.IAnalyticsService)
    .to(AnalyticsService)
    .inSingletonScope();

  bind<IPasswordResetService>(TYPES.IPasswordResetService)
    .to(PasswordResetService)
    .inSingletonScope();

  bind<ITaskDomainService>(TYPES.ITaskDomainService)
    .to(TaskDomainService)
    .inSingletonScope();

  bind<IAuthValidationService>(TYPES.IAuthValidationService)
    .to(AuthValidationService)
    .inSingletonScope();

  bind<ISecurityService>(TYPES.ISecurityService)
    .to(SecurityService)
    .inSingletonScope();

  bind<ITimeTrackingService>(TYPES.ITimeTrackingService)
    .to(TimeTrackingService)
    .inSingletonScope();

  bind<INotificationService>(TYPES.INotificationService)
    .to(NotificationService)
    .inSingletonScope();

  bind<ISprintDomainService>(TYPES.ISprintDomainService)
    .to(SprintDomainService)
    .inSingletonScope();

  bind<IEventDispatcher>(TYPES.IEventDispatcher)
    .to(EventDispatcher)
    .inSingletonScope();

  const useRedis = String(process.env.USE_REDIS || "").toLowerCase() === "true";
  if (useRedis) {
    bind<ICacheService>(TYPES.ICacheService)
      .to(RedisCacheService)
      .inSingletonScope();
  } else {
    bind<ICacheService>(TYPES.ICacheService)
      .to(InMemoryCacheService)
      .inSingletonScope();
  }

  bind<TaskEventSubscriber>(TYPES.TaskEventSubscriber)
    .to(TaskEventSubscriber)
    .inSingletonScope();

  bind<ProjectEventSubscriber>(TYPES.ProjectEventSubscriber)
    .to(ProjectEventSubscriber)
    .inSingletonScope();

  bind<SprintEventSubscriber>(TYPES.SprintEventSubscriber)
    .to(SprintEventSubscriber)
    .inSingletonScope();

  bind<ChatEventSubscriber>(TYPES.ChatEventSubscriber)
    .to(ChatEventSubscriber)
    .inSingletonScope();

  bind<MeetingEventSubscriber>(TYPES.MeetingEventSubscriber)
    .to(MeetingEventSubscriber)
    .inSingletonScope();
});
