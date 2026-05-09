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
import { ICacheService } from "../interface/services/ICacheService";

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
    @inject(TYPES.ICacheService) private _cacheService: ICacheService,
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
      const cacheKey = `org_plan_limits:${project.orgId}`;
      const planDataStr = await this._cacheService.get(cacheKey);
      let planData: { features: string[]; messageLimit: number };
      if (planDataStr) {
        planData = JSON.parse(planDataStr);
      } else {
        let messageLimit = 100;
        let features: string[] = [];

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
            features = plan.features || [];
            if (plan.limits && plan.limits.messages !== undefined) {
              messageLimit = plan.limits.messages;
            }
          }
        }
        planData = { features, messageLimit };
        await this._cacheService.set(cacheKey, JSON.stringify(planData), 3600);
      }
      if (type === "FILE" && !planData.features.includes("files")) {
        throw new QuotaExceededError(
          "Your current plan does not allow file uploads. Please upgrade!",
        );
      }
      if (planData.messageLimit !== -1) {
        const currentMessages =
          await this._chatRepo.countByProjectId(projectId);
        if (currentMessages >= planData.messageLimit) {
          throw new QuotaExceededError(
            `Message Limit of ${planData.messageLimit} Reached. Please upgrade your plan.`,
          );
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
    this._eventDispatcher.dispatch(CHAT_EVENTS.MESSAGE_SENT, { message });
    return message;
  }
}
