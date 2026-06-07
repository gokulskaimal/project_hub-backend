import { ContainerModule, interfaces } from "inversify";
import "reflect-metadata";
import { TYPES } from "../types";

//Interfaces - Services
import { IPlanRepo } from "../../../application/interface/repositories/IPlanRepo";
import { ISubscriptionRepo } from "../../../application/interface/repositories/ISubscriptionRepo";

//Interfaces - Repositories
import { IUserRepo } from "../../../application/interface/repositories/IUserRepo";
import { IOrgRepo } from "../../../application/interface/repositories/IOrgRepo";
import { IInviteRepo } from "../../../application/interface/repositories/IInviteRepo";
import { ITaskRepo } from "../../../application/interface/repositories/ITaskRepo";
import { IProjectRepo } from "../../../application/interface/repositories/IProjectRepo";
import { INotificationRepo } from "../../../application/interface/repositories/INotificationRepo";
import { ISprintRepo } from "../../../application/interface/repositories/ISprintRepo";
import { IInvoiceRepo } from "../../../application/interface/repositories/IInvoiceRepo";
import { IAnalyticsRepo } from "../../../application/interface/repositories/IAnalyticsRepo";
import { IMeetingRepo } from "../../../application/interface/repositories/IMeetingRepo";

//Interfaces - Use Cases

// Infrastructure Implementations - Services

// Domain Interfaces - Providers

// Infrastructure Implementations - Repositories
import { UserRepo } from "../../repositories/UserRepo";
import { OrgRepo } from "../../repositories/OrgRepo";
import { InviteRepo } from "../../repositories/InviteRepo";
import { PlanRepo } from "../../repositories/PlanRepo";
import { SubscriptionRepo } from "../../repositories/SubscriptionRepo";
import { TaskRepo } from "../../repositories/TaskRepo";
import { ProjectRepo } from "../../repositories/ProjectRepo";
import { NotificationRepo } from "../../repositories/NotificationRepo";
import { SprintRepo } from "../../repositories/SprintRepo";
import { ITaskHistoryRepo } from "../../../application/interface/repositories/ITaskHistoryRepo";
import { TaskHistoryRepo } from "../../repositories/TaskHistoryRepo";
import { InvoiceRepo } from "../../repositories/InvoiceRepo";
import { AnalyticsRepo } from "../../repositories/AnalyticsRepo";
import { MeetingRepo } from "../../repositories/MeetingRepo";

// Application Use Cases

// Presentation Controllers

// Chat Interfaces
import { IChatRepo } from "../../../application/interface/repositories/IChatRepo";
// Chat Implementations
import { ChatRepo } from "../../repositories/ChatRepo";

export const repositoryModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<IUserRepo>(TYPES.IUserRepo).to(UserRepo).inSingletonScope();
  bind<IOrgRepo>(TYPES.IOrgRepo).to(OrgRepo).inSingletonScope();
  bind<IInviteRepo>(TYPES.IInviteRepo).to(InviteRepo).inSingletonScope();
  bind<IPlanRepo>(TYPES.IPlanRepo).to(PlanRepo).inSingletonScope();
  bind<ISubscriptionRepo>(TYPES.ISubscriptionRepo)
    .to(SubscriptionRepo)
    .inSingletonScope();
  bind<ITaskRepo>(TYPES.ITaskRepo).to(TaskRepo).inSingletonScope();
  bind<IProjectRepo>(TYPES.IProjectRepo).to(ProjectRepo).inSingletonScope();

  bind<INotificationRepo>(TYPES.INotificationRepo)
    .to(NotificationRepo)
    .inSingletonScope();

  bind<IChatRepo>(TYPES.IChatRepo).to(ChatRepo).inSingletonScope();

  bind<ISprintRepo>(TYPES.ISprintRepo).to(SprintRepo).inSingletonScope();

  bind<IAnalyticsRepo>(TYPES.IAnalyticsRepo)
    .to(AnalyticsRepo)
    .inSingletonScope();

  bind<ITaskHistoryRepo>(TYPES.ITaskHistoryRepo)
    .to(TaskHistoryRepo)
    .inSingletonScope();

  bind<IInvoiceRepo>(TYPES.IInvoiceRepo).to(InvoiceRepo).inSingletonScope();
  bind<IMeetingRepo>(TYPES.IMeetingRepo).to(MeetingRepo).inSingletonScope();
});
