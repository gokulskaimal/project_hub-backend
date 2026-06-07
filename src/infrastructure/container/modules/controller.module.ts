import { ContainerModule, interfaces } from "inversify";
import "reflect-metadata";
import { TYPES } from "../types";

//Interfaces - Services

//Interfaces - Repositories

//Interfaces - Use Cases
import { IAdminInvoiceController } from "../../../presentation/interfaces/controllers/IAdminInvoiceController";
import { IManagerInvoiceController } from "../../../presentation/interfaces/controllers/IManagerInvoiceController";

// Infrastructure Implementations - Services

// Domain Interfaces - Providers

// Infrastructure Implementations - Repositories

// Application Use Cases

// Presentation Controllers
import { SessionController } from "../../../presentation/controllers/auth/SessionController";
import { RegistrationController } from "../../../presentation/controllers/auth/RegistrationController";
import { InviteController } from "../../../presentation/controllers/auth/InviteController";
import { PasswordController } from "../../../presentation/controllers/auth/PasswordController";

import { UserController } from "../../../presentation/controllers/user/UserController";
import { ManagerController } from "../../../presentation/controllers/manager/ManagerController";
import { PaymentController } from "../../../presentation/controllers/PaymentController";
import { WebhookController } from "../../../presentation/controllers/WebhookController";
import { AdminUserController } from "../../../presentation/controllers/admin/AdminUserController";
import { AdminOrgController } from "../../../presentation/controllers/admin/AdminOrgController";
import { AdminPlanController } from "../../../presentation/controllers/admin/AdminPlanController";
import { OrganizationController } from "../../../presentation/controllers/OrganizationController";
import { AdminInvoiceController } from "../../../presentation/controllers/admin/AdminInvoiceController";
import { ManagerInvoiceController } from "../../../presentation/controllers/manager/ManagerInvoiceController";

import { TaskController } from "../../../presentation/controllers/manager/TaskController";
import { ProjectController } from "../../../presentation/controllers/manager/ProjectController";
import { NotificationController } from "../../../presentation/controllers/NotificationController";
import { ChatController } from "../../../presentation/controllers/ChatController";
import { UploadController } from "../../../presentation/controllers/UploadController";
import { SprintController } from "../../../presentation/controllers/manager/SprintController";
import { MeetingController } from "../../../presentation/controllers/manager/MeetingController";

// Chat Interfaces
// Chat Implementations

export const controllerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<SessionController>(TYPES.SessionController)
    .to(SessionController)
    .inSingletonScope();
  bind<RegistrationController>(TYPES.RegistrationController)
    .to(RegistrationController)
    .inSingletonScope();
  bind<InviteController>(TYPES.InviteController)
    .to(InviteController)
    .inSingletonScope();
  bind<PasswordController>(TYPES.PasswordController)
    .to(PasswordController)
    .inSingletonScope();

  bind<AdminUserController>(TYPES.AdminUserController)
    .to(AdminUserController)
    .inSingletonScope();
  bind<AdminOrgController>(TYPES.AdminOrgController)
    .to(AdminOrgController)
    .inSingletonScope();
  bind<OrganizationController>(TYPES.OrganizationController)
    .to(OrganizationController)
    .inSingletonScope();
  bind<AdminPlanController>(TYPES.AdminPlanController)
    .to(AdminPlanController)
    .inSingletonScope();

  bind<IAdminInvoiceController>(TYPES.AdminInvoiceController)
    .to(AdminInvoiceController)
    .inSingletonScope();

  bind<IManagerInvoiceController>(TYPES.ManagerInvoiceController)
    .to(ManagerInvoiceController)
    .inSingletonScope();
  bind<UserController>(TYPES.UserController)
    .to(UserController)
    .inSingletonScope();
  bind<ManagerController>(TYPES.ManagerController)
    .to(ManagerController)
    .inSingletonScope();
  bind<PaymentController>(TYPES.PaymentController)
    .to(PaymentController)
    .inSingletonScope();
  bind<WebhookController>(TYPES.WebhookController)
    .to(WebhookController)
    .inSingletonScope();
  bind<TaskController>(TYPES.TaskController)
    .to(TaskController)
    .inSingletonScope();
  bind<ProjectController>(TYPES.ProjectController)
    .to(ProjectController)
    .inSingletonScope();

  bind<NotificationController>(TYPES.NotificationController)
    .to(NotificationController)
    .inSingletonScope();

  bind<ChatController>(TYPES.ChatController)
    .to(ChatController)
    .inSingletonScope();

  bind<UploadController>(TYPES.UploadController)
    .to(UploadController)
    .inSingletonScope();

  bind<SprintController>(TYPES.SprintController)
    .to(SprintController)
    .inSingletonScope();
  bind<MeetingController>(TYPES.MeetingController)
    .to(MeetingController)
    .inSingletonScope();
});
