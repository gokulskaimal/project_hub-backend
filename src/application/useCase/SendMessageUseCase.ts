import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IChatRepo } from "../../application/interface/repositories/IChatRepo";
import { ISendMessageUseCase } from "../interface/useCases/ISendMessageUseCase";
import { ISocketService } from "../../application/interface/services/ISocketService";
import { IProjectRepo } from "../../application/interface/repositories/IProjectRepo";
import { ChatMessage } from "../../domain/entities/ChatMessage";
import {
  EntityNotFoundError,
  QuotaExceededError,
} from "../../domain/errors/CommonErrors";
import { IOrgRepo } from "../../application/interface/repositories/IOrgRepo";
import { IPlanRepo } from "../../application/interface/repositories/IPlanRepo";
import { ISubscriptionRepo } from "../../application/interface/repositories/ISubscriptionRepo";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { UserRole } from "../../domain/enums/UserRole";
import { ICreateNotificationUseCase } from "../interface/useCases/ICreateNotificationUseCase";
import { ISecurityService } from "../../application/interface/services/ISecurityService";
import { NotificationType } from "../../domain/enums/NotificationType";

@injectable()
export class SendMessageUseCase implements ISendMessageUseCase {
  constructor(
    @inject(TYPES.IChatRepo) private _chatRepo: IChatRepo,
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
    @inject(TYPES.ICreateNotificationUseCase)
    private _createNotificationUseCase: ICreateNotificationUseCase,
    @inject(TYPES.IOrgRepo) private _orgRepo: IOrgRepo,
    @inject(TYPES.IPlanRepo) private _planRepo: IPlanRepo,
    @inject(TYPES.ISubscriptionRepo)
    private _subscriptionRepo: ISubscriptionRepo,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(
    senderId: string,
    projectId: string,
    content: string,
    type?: "TEXT" | "FILE" | "IMAGE" | "SYSTEM" | "ACTIVITY",
    fileUrl?: string,
  ): Promise<ChatMessage> {
    const project = await this._projectRepo.findById(projectId);
    if (!project) {
      throw new EntityNotFoundError("Project not found");
    }

    // RBAC Check
    if (project.orgId) {
      await this._securityService.validateOrgAccess(senderId, project.orgId);
    }

    // --- Message & Feature Limits Check ---
    if (project.orgId) {
      let messageLimit = 100; // Default Free limit
      const organization = await this._orgRepo.findById(project.orgId);

      if (organization && organization.createdBy) {
        const subscription = await this._subscriptionRepo.findByUserId(
          organization.createdBy,
        );
        let plan;

        if (!subscription || subscription.status !== "active") {
          // Fallback to Free Plan limits
          const freePlans = await this._planRepo.findAll({ isActive: true });
          plan = freePlans.find((p) => p.price === 0);
        } else {
          plan = await this._planRepo.findById(subscription.planId);
        }

        if (plan) {
          // 1. Enforce File Attachment Feature
          if (
            type === "FILE" &&
            plan.features &&
            !plan.features.includes("file_upload")
          ) {
            throw new QuotaExceededError(
              "Your current plan does not support file attachments in chat. Please upgrade.",
            );
          }

          // Extract message limits
          if (plan.limits && plan.limits.messages !== undefined) {
            messageLimit = plan.limits.messages;
          }
        }

        // 2. Enforce Max Message Count per project
        if (messageLimit !== -1) {
          const currentMessages =
            await this._chatRepo.countByProjectId(projectId);
          if (currentMessages >= messageLimit) {
            throw new QuotaExceededError(
              `Message limit of ${messageLimit} reached for this project. Please upgrade your plan.`,
            );
          }
        }
      }
    }

    const message = await this._chatRepo.create({
      senderId,
      projectId,
      content,
      type,
      fileUrl,
    });

    this._socketService.emitToProject(projectId, "chat:message", message);

    const notificationPayload = {
      projectId,
      projectName: project.name,
      senderName: message.senderName,
      content: message.content,
      messageId: message.id,
    };

    // 1. Notify Assigned Team Members
    if (project.teamMemberIds) {
      project.teamMemberIds.forEach(async (memberId) => {
        if (memberId.toString() === senderId.toString()) return;

        // Live Toast (Clickable to Chat)
        this._socketService.emitToUser(
          memberId.toString(),
          "chat:notification",
          notificationPayload,
        );

        // Persistent Notification (For Bell Panel)
        await this._createNotificationUseCase
          .execute(
            memberId.toString(),
            "New Chat Message",
            `New message from ${message.senderName} in ${project.name}`,
            NotificationType.INFO,
            `/member/projects/${projectId}`,
          )
          .catch((err: unknown) =>
            console.error("Failed to create chat notification", err),
          );
      });
    }

    // 2. Notify Organization Managers (Managers are not always in teamMemberIds)
    if (project.orgId) {
      const managers = await this._userRepo.findByOrgAndRole(
        project.orgId,
        UserRole.ORG_MANAGER,
      );
      managers.forEach(async (manager) => {
        if (manager.id.toString() !== senderId.toString()) {
          // Don't notify if manager sent it
          // Live Toast (Clickable to Chat)
          this._socketService.emitToUser(
            manager.id.toString(),
            "chat:notification",
            notificationPayload,
          );

          // Persistent Notification (For Bell Panel)
          await this._createNotificationUseCase
            .execute(
              manager.id.toString(),
              "New Chat Message",
              `New message from ${message.senderName} in ${project.name}`,

              NotificationType.INFO,
              `/manager/projects/${projectId}`, // Corrected link for managers
            )
            .catch((err: unknown) =>
              console.error("Failed to create chat notification", err),
            );
        }
      });
    }

    return message;
  }
}
