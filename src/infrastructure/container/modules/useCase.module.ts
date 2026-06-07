import { ContainerModule, interfaces } from "inversify";
import "reflect-metadata";
import { TYPES } from "../types";

//Interfaces - Services

//Interfaces - Repositories

//Interfaces - Use Cases
import { ILoginUseCase } from "../../../application/interface/useCases/ILoginUseCase";
import { IRegisterUseCase } from "../../../application/interface/useCases/IRegisterUseCase";
import { IGoogleSignInUseCase } from "../../../application/interface/useCases/IGoogleSignInUseCase";
import { ITokenRefreshUseCase } from "../../../application/interface/useCases/ITokenRefreshUseCase";
import { ILogoutUseCase } from "../../../application/interface/useCases/ILogoutUseCase";
import { IVerifyEmailUseCase } from "../../../application/interface/useCases/IVerifyEmailUseCase";
import { IValidateTokenUseCase } from "../../../application/interface/useCases/IValidateTokenUseCase";
import { IRegisterManagerUseCase } from "../../../application/interface/useCases/IRegisterManagerUseCase";
import { ISendOtpUseCase } from "../../../application/interface/useCases/ISendOtpUseCase";
import { IVerifyOtpUseCase } from "../../../application/interface/useCases/IVerifyOtpUseCase";
import { ICompleteSignupUseCase } from "../../../application/interface/useCases/ICompleteSignupUseCase";
import { IAcceptUseCase } from "../../../application/interface/useCases/IAcceptUseCase";
import { IInviteMemberUseCase } from "../../../application/interface/useCases/IInviteMemberUseCase";
import { IResetPasswordUseCase } from "../../../application/interface/useCases/IResetPasswordUseCase";
import { IUserProfileUseCase } from "../../../application/interface/useCases/IUserProfileUseCase";
import { IOrganizationManagementUseCase } from "../../../application/interface/useCases/IOrganizationManagementUseCase";
import { ICreateSubscriptionUseCase } from "../../../application/interface/useCases/ICreateSubscriptionUseCase";
import { IHandleRazorpayWebhookUseCase } from "../../../application/interface/useCases/IHandleRazorpayWebhookUseCase";
import { IVerifyPaymentUseCase } from "../../../application/interface/useCases/IVerifyPaymentUseCase";
import { IGetPlanUseCase } from "../../../application/interface/useCases/IGetPlanUseCase";
import { ICreatePlanUseCase } from "../../../application/interface/useCases/ICreatePlanUseCase";
import { IUpdatePlanUseCase } from "../../../application/interface/useCases/IUpdatePlanUseCase";

import { IDeletePlanUseCase } from "../../../application/interface/useCases/IDeletePlanUseCase";
import { IOrganizationQueryUseCase } from "../../../application/interface/useCases/IOrganizationQueryUseCase";
import { IUserQueryUseCase } from "../../../application/interface/useCases/IUserQueryUseCase";
import { IUserManagementUseCase } from "../../../application/interface/useCases/IUserManagementUseCase";
import { IAdminStatsUseCase } from "../../../application/interface/useCases/IAdminStatsUseCase";
import { IGetAdminInvoicesUseCase } from "../../../application/interface/useCases/IGetAdminInvoicesUseCase";
import { IGetAdminAnalyticsUseCase } from "../../../application/interface/useCases/IGetAdminAnalyticsUseCase";
import { IGetMemberAnalyticsUseCase } from "../../../application/interface/useCases/IGetMemberAnalyticsUseCase";
import { IGetOrgInvoicesUseCase } from "../../../application/interface/useCases/IGetOrgInvoicesUseCase";

import { ICreateProjectUseCase } from "../../../application/interface/useCases/ICreateProjectUseCase";
import { IGetProjectUseCase } from "../../../application/interface/useCases/IGetProjectUseCase";
import { IUpdateProjectUseCase } from "../../../application/interface/useCases/IUpdateProjectUseCase";
import { IDeleteProjectUseCase } from "../../../application/interface/useCases/IDeleteProjectUseCase";
import { IGetMemberProjectsUseCase } from "../../../application/interface/useCases/IGetMemberProjectsUseCase";
import { IGetMemberTasksUseCase } from "../../../application/interface/useCases/IGetMemberTasksUseCase";
import { IGetOrgTasksUseCase } from "../../../application/interface/useCases/IGetOrgTasksUseCase";
import { IGetUserVelocityUseCase } from "../../../application/interface/useCases/IGetUserVelocityUseCase";
import { IGetProjectByIdUseCase } from "../../../application/interface/useCases/IGetProjectByIdUseCase";
import { IGetProjectVelocityUseCase } from "../../../application/interface/useCases/IGetProjectVelocityUseCase";
import { IGetManagerAnalyticsUseCase } from "../../../application/interface/useCases/IGetManagerAnalyticsUseCase";
import { ICreateTaskUseCase } from "../../../application/interface/useCases/ICreateTaskUseCase";
import {
  IGetTaskUseCase,
  IGetTaskByIdUseCase,
} from "../../../application/interface/useCases/IGetTaskUseCase";
import { IGetTaskHistoryUseCase } from "../../../application/interface/useCases/IGetTaskHistoryUseCase";
import { GetTaskByIdUseCase } from "../../../application/useCase/GetTaskByIdUseCase";
import { IUpdateTaskUseCase } from "../../../application/interface/useCases/IUpdateTaskUseCase";
import { IDeleteTaskUseCase } from "../../../application/interface/useCases/IDeleteTaskUseCase";
import { IGetProjectSprintsUseCase } from "../../../application/interface/useCases/IGetProjectSprintsUseCase";
import { ICreateSprintUseCase } from "../../../application/interface/useCases/ICreateSprintUseCase";
import { IUpdateSprintUseCase } from "../../../application/interface/useCases/IUpdateSprintUseCase";
import { IDeleteSprintUseCase } from "../../../application/interface/useCases/IDeleteSprintUseCase";
import { ICreateNotificationUseCase } from "../../../application/interface/useCases/ICreateNotificationUseCase";
import { IGetProjectMembersUseCase } from "../../../application/interface/useCases/IGetProjectMembersUseCase";
import { IInvitationQueryUseCase } from "../../../application/interface/useCases/IInvitationQueryUseCase";
import { IGetOrgAnalyticsUseCase } from "../../../application/interface/useCases/IGetOrgAnalyticsUseCase";
import { ICreateMeetingUseCase } from "../../../application/interface/useCases/ICreateMeetingUseCase";
import { IGetMyMeetingsUseCase } from "../../../application/interface/useCases/IGetMyMeetingsUseCase";
import { IUpdateMeetingUseCase } from "../../../application/interface/useCases/IUpdateMeetingUseCase";
import { IDeleteMeetingUseCase } from "../../../application/interface/useCases/IDeleteMeetingUseCase";
import { IGetSprintMeetingUseCase } from "../../../application/interface/useCases/IGetSprintMeetingUseCase";
import { ICompleteMeetingUseCase } from "../../../application/interface/useCases/ICompleteMeetingUseCase";

// Infrastructure Implementations - Services

// Domain Interfaces - Providers

// Infrastructure Implementations - Repositories

// Application Use Cases
import { LoginUseCase } from "../../../application/useCase/LoginUseCase";
import { RegisterUseCase } from "../../../application/useCase/RegisterUseCase";
import { GoogleSignInUseCase } from "../../../application/useCase/GoogleSignInUseCase";
import { TokenRefreshUseCase } from "../../../application/useCase/TokenRefreshUseCase";
import { LogoutUseCase } from "../../../application/useCase/LogoutUseCase";
import { VerifyEmailUseCase } from "../../../application/useCase/VerifyEmailUseCase";
import { ValidateTokenUseCase } from "../../../application/useCase/ValidateTokenUseCase";
import { RegisterManagerUseCase } from "../../../application/useCase/RegisterManagerUseCase";
import { SendOtpUseCase } from "../../../application/useCase/SendOtpUseCase";
import { VerifyOtpUseCase } from "../../../application/useCase/VerifyOtpUseCase";
import { CompleteSignupUseCase } from "../../../application/useCase/CompleteSignupUseCase";
import { AcceptUseCase } from "../../../application/useCase/AcceptUseCase";
import { InviteMemberUseCase } from "../../../application/useCase/InviteMemberUseCase";
import { ResetPasswordUseCase } from "../../../application/useCase/ResetPasswordUseCase";
import { UserProfileUseCase } from "../../../application/useCase/UserProfileUseCase";
import { OrganizationManagementUseCase } from "../../../application/useCase/OrganizationManagementUseCase";
import { CreatePlanUseCase } from "../../../application/useCase/CreatePlanUseCase";
import { GetPlansUseCase } from "../../../application/useCase/GetPlansUseCase";
import { CreateSubscriptionUseCase } from "../../../application/useCase/CreateSubscriptionUseCase";
import { HandleRazorpayWebhookUseCase } from "../../../application/useCase/HandleRazorpayWebhookUseCase";
import { VerifyPaymentUseCase } from "../../../application/useCase/VerifyPaymentUseCase";
import { UpdatePlanUseCase } from "../../../application/useCase/UpdatePlanUseCase";
import { DeletePlanUseCase } from "../../../application/useCase/DeletePlanUseCase";
import { OrganizationQueryUseCase } from "../../../application/useCase/OrganizationQueryUseCase";
import { UserQueryUseCase } from "../../../application/useCase/UserQueryUseCase";
import { UserManagementUseCase } from "../../../application/useCase/UserManagementUseCase";
import { AdminStatsUseCase } from "../../../application/useCase/AdminStatsUseCase";
import { GetAdminInvoicesUseCase } from "../../../application/useCase/GetAdminInvoicesUseCase";
import { GetAdminAnalyticsUseCase } from "../../../application/useCase/GetAdminAnalyticsUseCase";
import { GetMemberAnalyticsUseCase } from "../../../application/useCase/GetMemberAnalyticsUseCase";
import { GetOrgInvoicesUseCase } from "../../../application/useCase/GetOrgInvoicesUseCase";

import { CreateTaskUseCase } from "../../../application/useCase/CreateTaskUseCase";
import { GetTaskUseCase } from "../../../application/useCase/GetTaskUseCase";
import { GetTaskHistoryUseCase } from "../../../application/useCase/GetTaskHistoryUseCase";
import { UpdateTaskUseCase } from "../../../application/useCase/UpdateTaskUseCase";
import { DeleteTaskUseCase } from "../../../application/useCase/DeleteTaskUseCase";
import { CreateNotificationUseCase } from "../../../application/useCase/CreateNotificationUseCase";
import { GetNotificationsUseCase } from "../../../application/useCase/GetNotificationsUseCase";
import { MarkNotificationReadUseCase } from "../../../application/useCase/MarkNotificationReadUseCase";
import { CreateSprintUseCase } from "../../../application/useCase/CreateSprintUseCase";
import { UpdateSprintUseCase } from "../../../application/useCase/UpdateSprintUseCase";
import { DeleteSprintUseCase } from "../../../application/useCase/DeleteSprintUseCase";
import { GetProjectSprintsUseCase } from "../../../application/useCase/GetProjectSprintsUseCase";
import { MarkAllNotificationsReadUseCase } from "../../../application/useCase/MarkAllNotificationsReadUseCase";
import { IGetNotificationsUseCase } from "../../../application/interface/useCases/IGetNotificationsUseCase";
import { IMarkNotificationReadUseCase } from "../../../application/interface/useCases/IMarkNotificationReadUseCase";
import { IMarkAllNotificationsReadUseCase } from "../../../application/interface/useCases/IMarkAllNotificationsReadUseCase";
import { IToggleTimerUseCase } from "../../../application/interface/useCases/IToggleTimerUseCase";

import { CreateProjectUseCase } from "../../../application/useCase/CreateProjectUseCase";
import { GetProjectUseCase } from "../../../application/useCase/GetProjectUseCase";
import { GetProjectByIdUseCase } from "../../../application/useCase/GetProjectByIdUseCase";
import { GetProjectVelocityUseCase } from "../../../application/useCase/GetProjectVelocityUseCase";
import { UpdateProjectUseCase } from "../../../application/useCase/UpdateProjectUseCase";
import { DeleteProjectUseCase } from "../../../application/useCase/DeleteProjectUseCase";
import { GetMemberProjectsUseCase } from "../../../application/useCase/GetMemberProjectsUseCase";
import { GetMemberTasksUseCase } from "../../../application/useCase/GetMemberTasksUseCase";
import { GetOrgTasksUseCase } from "../../../application/useCase/GetOrgTasksUseCase";
import { GetUserVelocityUseCase } from "../../../application/useCase/GetUserVelocityUseCase";
import { ToggleTimerUseCase } from "../../../application/useCase/ToggleTimerUseCase";
import { GetProjectMembersUseCase } from "../../../application/useCase/GetProjectMembersUseCase";
import { CreateMeetingUseCase } from "../../../application/useCase/CreateMeetingUseCase";
import { UpdateMeetingUseCase } from "../../../application/useCase/UpdateMeeting";
import { GetMyMeetingsUseCase } from "../../../application/useCase/GetMyMeetings";
import { GetSprintMeetingUseCase } from "../../../application/useCase/GetSprintMeetingUseCase";
import { DeleteMeetingUseCase } from "../../../application/useCase/DeleteMeetingUseCase";
import { CompleteMeetingUseCase } from "../../../application/useCase/CompleteMeetingUseCase";
// Presentation Controllers

// Chat Interfaces
import { ISendMessageUseCase } from "../../../application/interface/useCases/ISendMessageUseCase";
import { IGetProjectMessagesUseCase } from "../../../application/interface/useCases/IGetProjectMessagesUseCase";
import { IAddCommentUseCase } from "../../../application/interface/useCases/IAddCommentUseCase";
import { IAddAttachmentUseCase } from "../../../application/interface/useCases/IAddAttachmentUseCase";
// Chat Implementations
import { SendMessageUseCase } from "../../../application/useCase/SendMessageUseCase";
import { GetProjectMessagesUseCase } from "../../../application/useCase/GetProjectMessagesUseCase";
import { IEditMessageUseCase } from "../../../application/interface/useCases/IEditMessageUseCase";
import { IDeleteMessageUseCase } from "../../../application/interface/useCases/IDeleteMessageUseCase";
import { EditMessageUseCase } from "../../../application/useCase/EditMessageUseCase";
import { DeleteMessageUseCase } from "../../../application/useCase/DeleteMessageUseCase";
import { GetManagerAnalyticsUseCase } from "../../../application/useCase/GetManagerAnalyticsUseCase";
import { InvitationQueryUseCase } from "../../../application/useCase/InvitationQueryUseCase";
import { GetOrgAnalyticsUseCase } from "../../../application/useCase/GetOrgAnalyticsUseCase";
import { AddCommentUseCase } from "../../../application/useCase/AddCommentUseCase";
import { AddAttachmentUseCase } from "../../../application/useCase/AddAttachmentUseCase";

export const useCaseModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<ILoginUseCase>(TYPES.ILoginUseCase).to(LoginUseCase).inTransientScope();
  bind<IRegisterUseCase>(TYPES.IRegisterUseCase)
    .to(RegisterUseCase)
    .inTransientScope();
  bind<IGoogleSignInUseCase>(TYPES.IGoogleSignInUseCase)
    .to(GoogleSignInUseCase)
    .inTransientScope();
  bind<ITokenRefreshUseCase>(TYPES.ITokenRefreshUseCase)
    .to(TokenRefreshUseCase)
    .inTransientScope();
  bind<ILogoutUseCase>(TYPES.ILogoutUseCase)
    .to(LogoutUseCase)
    .inTransientScope();
  bind<IVerifyEmailUseCase>(TYPES.IVerifyEmailUseCase)
    .to(VerifyEmailUseCase)
    .inTransientScope();
  bind<IValidateTokenUseCase>(TYPES.IValidateTokenUseCase)
    .to(ValidateTokenUseCase)
    .inTransientScope();
  bind<IRegisterManagerUseCase>(TYPES.IRegisterManagerUseCase)
    .to(RegisterManagerUseCase)
    .inTransientScope();
  bind<ISendOtpUseCase>(TYPES.ISendOtpUseCase)
    .to(SendOtpUseCase)
    .inTransientScope();
  bind<IVerifyOtpUseCase>(TYPES.IVerifyOtpUseCase)
    .to(VerifyOtpUseCase)
    .inTransientScope();
  bind<ICompleteSignupUseCase>(TYPES.ICompleteSignupUseCase)
    .to(CompleteSignupUseCase)
    .inTransientScope();
  bind<IAcceptUseCase>(TYPES.IAcceptUseCase)
    .to(AcceptUseCase)
    .inTransientScope();
  bind<IInviteMemberUseCase>(TYPES.IInviteMemberUseCase)
    .to(InviteMemberUseCase)
    .inTransientScope();
  bind<IResetPasswordUseCase>(TYPES.IResetPasswordUseCase)
    .to(ResetPasswordUseCase)
    .inTransientScope();
  bind<IUserProfileUseCase>(TYPES.IUserProfileUseCase)
    .to(UserProfileUseCase)
    .inTransientScope();
  bind<IOrganizationManagementUseCase>(TYPES.IOrganizationManagementUseCase)
    .to(OrganizationManagementUseCase)
    .inTransientScope();
  bind<ICreatePlanUseCase>(TYPES.ICreatePlanUseCase)
    .to(CreatePlanUseCase)
    .inTransientScope();
  bind<IGetPlanUseCase>(TYPES.IGetPlanUseCase)
    .to(GetPlansUseCase)
    .inTransientScope();
  bind<ICreateSubscriptionUseCase>(TYPES.ICreateSubscriptionUseCase)
    .to(CreateSubscriptionUseCase)
    .inTransientScope();
  bind<IVerifyPaymentUseCase>(TYPES.IVerifyPaymentUseCase)
    .to(VerifyPaymentUseCase)
    .inTransientScope();
  bind<IHandleRazorpayWebhookUseCase>(TYPES.IHandleRazorpayWebhookUseCase)
    .to(HandleRazorpayWebhookUseCase)
    .inTransientScope();
  bind<IUpdatePlanUseCase>(TYPES.IUpdatePlanUseCase)
    .to(UpdatePlanUseCase)
    .inTransientScope();
  bind<IDeletePlanUseCase>(TYPES.IDeletePlanUseCase)
    .to(DeletePlanUseCase)
    .inTransientScope();
  bind<IOrganizationQueryUseCase>(TYPES.IOrganizationQueryUseCase)
    .to(OrganizationQueryUseCase)
    .inTransientScope();
  bind<IUserQueryUseCase>(TYPES.IUserQueryUseCase)
    .to(UserQueryUseCase)
    .inTransientScope();
  bind<IUserManagementUseCase>(TYPES.IUserManagementUseCase)
    .to(UserManagementUseCase)
    .inTransientScope();
  bind<IAdminStatsUseCase>(TYPES.IAdminStatsUseCase)
    .to(AdminStatsUseCase)
    .inTransientScope();

  bind<IGetAdminAnalyticsUseCase>(TYPES.IGetAdminAnalyticsUseCase)
    .to(GetAdminAnalyticsUseCase)
    .inTransientScope();

  bind<IGetAdminInvoicesUseCase>(TYPES.IGetAdminInvoicesUseCase)
    .to(GetAdminInvoicesUseCase)
    .inTransientScope();

  bind<IGetOrgInvoicesUseCase>(TYPES.IGetOrgInvoicesUseCase)
    .to(GetOrgInvoicesUseCase)
    .inTransientScope();
  bind<ICreateTaskUseCase>(TYPES.ICreateTaskUseCase)
    .to(CreateTaskUseCase)
    .inTransientScope();
  bind<IGetTaskUseCase>(TYPES.IGetTaskUseCase)
    .to(GetTaskUseCase)
    .inSingletonScope();
  bind<IGetTaskByIdUseCase>(TYPES.IGetTaskByIdUseCase)
    .to(GetTaskByIdUseCase)
    .inSingletonScope();
  bind<IUpdateTaskUseCase>(TYPES.IUpdateTaskUseCase)
    .to(UpdateTaskUseCase)
    .inTransientScope();
  bind<IDeleteTaskUseCase>(TYPES.IDeleteTaskUseCase)
    .to(DeleteTaskUseCase)
    .inTransientScope();

  bind<IToggleTimerUseCase>(TYPES.IToggleTimerUseCase)
    .to(ToggleTimerUseCase)
    .inTransientScope();
  bind<ICreateProjectUseCase>(TYPES.ICreateProjectUseCase)
    .to(CreateProjectUseCase)
    .inTransientScope();
  bind<IGetProjectUseCase>(TYPES.IGetProjectUseCase)
    .to(GetProjectUseCase)
    .inTransientScope();
  bind<IGetProjectMembersUseCase>(TYPES.IGetProjectMembersUseCase)
    .to(GetProjectMembersUseCase)
    .inTransientScope();

  bind<IGetProjectByIdUseCase>(TYPES.IGetProjectByIdUseCase)
    .to(GetProjectByIdUseCase)
    .inTransientScope();

  bind<IGetProjectVelocityUseCase>(TYPES.IGetProjectVelocityUseCase)
    .to(GetProjectVelocityUseCase)
    .inTransientScope();

  bind<IGetManagerAnalyticsUseCase>(TYPES.IGetManagerAnalyticsUseCase)
    .to(GetManagerAnalyticsUseCase)
    .inTransientScope();

  bind<IUpdateProjectUseCase>(TYPES.IUpdateProjectUseCase)
    .to(UpdateProjectUseCase)
    .inTransientScope();

  bind<IDeleteProjectUseCase>(TYPES.IDeleteProjectUseCase)
    .to(DeleteProjectUseCase)
    .inTransientScope();

  bind<IGetMemberAnalyticsUseCase>(TYPES.IGetMemberAnalyticsUseCase)
    .to(GetMemberAnalyticsUseCase)
    .inTransientScope();

  bind<IGetMemberProjectsUseCase>(TYPES.IGetMemberProjectsUseCase)
    .to(GetMemberProjectsUseCase)
    .inTransientScope();

  bind<IGetMemberTasksUseCase>(TYPES.IGetMemberTasksUseCase)
    .to(GetMemberTasksUseCase)
    .inTransientScope();

  bind<IGetOrgTasksUseCase>(TYPES.IGetOrgTasksUseCase)
    .to(GetOrgTasksUseCase)
    .inTransientScope();

  bind<IGetUserVelocityUseCase>(TYPES.IGetUserVelocityUseCase)
    .to(GetUserVelocityUseCase)
    .inTransientScope();

  bind<ICreateNotificationUseCase>(TYPES.ICreateNotificationUseCase)
    .to(CreateNotificationUseCase)
    .inTransientScope();

  bind<IGetNotificationsUseCase>(TYPES.IGetNotificationsUseCase)
    .to(GetNotificationsUseCase)
    .inTransientScope();

  bind<IMarkNotificationReadUseCase>(TYPES.IMarkNotificationReadUseCase)
    .to(MarkNotificationReadUseCase)
    .inTransientScope();

  bind<IMarkAllNotificationsReadUseCase>(TYPES.IMarkAllNotificationsReadUseCase)
    .to(MarkAllNotificationsReadUseCase)
    .inTransientScope();

  bind<ISendMessageUseCase>(TYPES.ISendMessageUseCase)
    .to(SendMessageUseCase)
    .inTransientScope();

  bind<IAddCommentUseCase>(TYPES.IAddCommentUseCase)
    .to(AddCommentUseCase)
    .inTransientScope();

  bind<IAddAttachmentUseCase>(TYPES.IAddAttachmentUseCase)
    .to(AddAttachmentUseCase)
    .inTransientScope();

  bind<IGetProjectMessagesUseCase>(TYPES.IGetProjectMessagesUseCase)
    .to(GetProjectMessagesUseCase)
    .inTransientScope();

  bind<IEditMessageUseCase>(TYPES.IEditMessageUseCase)
    .to(EditMessageUseCase)
    .inTransientScope();

  bind<IDeleteMessageUseCase>(TYPES.IDeleteMessageUseCase)
    .to(DeleteMessageUseCase)
    .inTransientScope();

  bind<ICreateSprintUseCase>(TYPES.ICreateSprintUseCase)
    .to(CreateSprintUseCase)
    .inTransientScope();

  bind<IUpdateSprintUseCase>(TYPES.IUpdateSprintUseCase)
    .to(UpdateSprintUseCase)
    .inTransientScope();

  bind<IDeleteSprintUseCase>(TYPES.IDeleteSprintUseCase)
    .to(DeleteSprintUseCase)
    .inTransientScope();

  bind<IGetProjectSprintsUseCase>(TYPES.IGetProjectSprintsUseCase)
    .to(GetProjectSprintsUseCase)
    .inTransientScope();

  bind<IGetTaskHistoryUseCase>(TYPES.IGetTaskHistoryUseCase)
    .to(GetTaskHistoryUseCase)
    .inTransientScope();

  bind<IInvitationQueryUseCase>(TYPES.IInvitationQueryUseCase)
    .to(InvitationQueryUseCase)
    .inTransientScope();

  bind<IGetOrgAnalyticsUseCase>(TYPES.IGetOrgAnalyticsUseCase)
    .to(GetOrgAnalyticsUseCase)
    .inTransientScope();
  bind<ICreateMeetingUseCase>(TYPES.ICreateMeetingUseCase)
    .to(CreateMeetingUseCase)
    .inTransientScope();
  bind<IGetSprintMeetingUseCase>(TYPES.IGetSprintMeetingsUseCase)
    .to(GetSprintMeetingUseCase)
    .inTransientScope();
  bind<IUpdateMeetingUseCase>(TYPES.IUpdateMeetingUseCase)
    .to(UpdateMeetingUseCase)
    .inTransientScope();
  bind<IGetMyMeetingsUseCase>(TYPES.IGetMyMeetingsUseCase)
    .to(GetMyMeetingsUseCase)
    .inTransientScope();
  bind<ICompleteMeetingUseCase>(TYPES.ICompleteMeetingUseCase)
    .to(CompleteMeetingUseCase)
    .inTransientScope();
  bind<IDeleteMeetingUseCase>(TYPES.IDeleteMeetingUseCase)
    .to(DeleteMeetingUseCase)
    .inTransientScope();
});
