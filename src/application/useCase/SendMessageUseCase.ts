import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IChatRepo } from "../../application/interface/repositories/IChatRepo";
import { ISendMessageUseCase } from "../interface/useCases/ISendMessageUseCase";
import { IProjectRepo } from "../../application/interface/repositories/IProjectRepo";
import { ChatMessage } from "../../domain/entities/ChatMessage";
import {
  EntityNotFoundError,
  QuotaExceededError,
} from "../../domain/errors/CommonErrors";
import { IOrgRepo } from "../../application/interface/repositories/IOrgRepo";
import { IPlanRepo } from "../../application/interface/repositories/IPlanRepo";
import { ISubscriptionRepo } from "../../application/interface/repositories/ISubscriptionRepo";
import { ISecurityService } from "../../application/interface/services/ISecurityService";
import { IEventDispatcher } from "../interface/services/IEventDispatcher";
import { CHAT_EVENTS } from "../events/ChatEvents";

@injectable()
export class SendMessageUseCase implements ISendMessageUseCase {
  constructor(
    @inject(TYPES.IChatRepo) private _chatRepo: IChatRepo,
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.IOrgRepo) private _orgRepo: IOrgRepo,
    @inject(TYPES.IPlanRepo) private _planRepo: IPlanRepo,
    @inject(TYPES.ISubscriptionRepo)
    private _subscriptionRepo: ISubscriptionRepo,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
    @inject(TYPES.IEventDispatcher) private _eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    senderId: string,
    projectId: string,
    content: string,
    type?: "TEXT" | "FILE" | "IMAGE" | "SYSTEM" | "ACTIVITY",
    fileUrl?: string,
  ): Promise<ChatMessage> {
    const project = await this._projectRepo.findById(projectId);
    if (!project) throw new EntityNotFoundError("Project not found");

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
          const freePlans = await this._planRepo.findAll({ isActive: true });
          plan = freePlans.find((p) => p.price === 0);
        } else {
          plan = await this._planRepo.findById(subscription.planId);
        }

        if (plan) {
          if (
            type === "FILE" &&
            plan.features &&
            !plan.features.includes("file_upload")
          ) {
            throw new QuotaExceededError(
              "Your current plan does not support file attachments in chat. Please upgrade.",
            );
          }
          if (plan.limits && plan.limits.messages !== undefined) {
            messageLimit = plan.limits.messages;
          }
        }

        if (messageLimit !== -1) {
          const currentMessages =
            await this._chatRepo.countByProjectId(projectId);
          if (currentMessages >= messageLimit) {
            throw new QuotaExceededError(
              `Message limit of ${messageLimit} reached. Please upgrade your plan.`,
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

    // DISPATCH EVENT - Side effects (Real-time & Bell Notifications) are now handled globally in Subscriber
    this._eventDispatcher.dispatch(CHAT_EVENTS.MESSAGE_SENT, {
      message,
    });

    return message;
  }
}
