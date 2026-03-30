import { injectable, inject } from "inversify";
import { IProjectRepo } from "../../application/interface/repositories/IProjectRepo";
import { TYPES } from "../../infrastructure/container/types";
import { UserRole } from "../../domain/enums/UserRole";
import { ISubscriptionRepo } from "../../application/interface/repositories/ISubscriptionRepo";
import { IPlanRepo } from "../../application/interface/repositories/IPlanRepo";
import { ISocketService } from "../../application/interface/services/ISocketService";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { ICreateNotificationUseCase } from "../interface/useCases/ICreateNotificationUseCase";
import { NotificationType } from "../../domain/enums/NotificationType";
import { ICreateProjectUseCase } from "../interface/useCases/ICreateProjectUseCase";
import { Project } from "../../domain/entities/Project";
import {
  QuotaExceededError,
  EntityNotFoundError,
  ValidationError,
} from "../../domain/errors/CommonErrors";
import { IAuthValidationService } from "../../application/interface/services/IAuthValidationService";
import { ISecurityService } from "../../application/interface/services/ISecurityService";
import { PLAN_DEFAULTS } from "../../infrastructure/config/common.constants";

import { ILogger } from "../../application/interface/services/ILogger";

@injectable()
export class CreateProjectUseCase implements ICreateProjectUseCase {
  constructor(
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.ISubscriptionRepo) private _subRepo: ISubscriptionRepo,
    @inject(TYPES.IPlanRepo) private _planRepo: IPlanRepo,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
    @inject(TYPES.ICreateNotificationUseCase)
    private _createNotificationUseCase: ICreateNotificationUseCase,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.IAuthValidationService)
    private _authValidationService: IAuthValidationService,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(
    userId: string,
    orgId: string,
    data: Partial<Project>,
  ): Promise<Project> {
    if (!data.name) throw new ValidationError("Project name is required");
    this._authValidationService.validateProjectName(data.name);

    // RBAC Check
    await this._securityService.validateOrgManager(userId, orgId);

    this._logger.info(`Checking subscription for userId: ${userId}`);

    let limit: number = PLAN_DEFAULTS.PROJECT_LIMIT; // Default
    const subscription = await this._subRepo.findByUserId(userId);

    if (!subscription || subscription.status !== "active") {
      this._logger.warn(
        `No subscription found for userId: ${userId}. Attempting to use Free Plan limits.`,
      );
      // Fallback: Find a Free Plan (price == 0)
      const freePlans = await this._planRepo.findAll({ isActive: true });
      const freePlan = freePlans.find((p) => p.price === 0);

      if (freePlan) {
        this._logger.info(
          `Using Free Plan limits: ${freePlan.name} (Limit: ${freePlan.limits?.projects})`,
        );
        limit = freePlan.limits?.projects ?? PLAN_DEFAULTS.PROJECT_LIMIT;
      } else {
        this._logger.error("No free plan found in system to fallback to.");
        throw new EntityNotFoundError(
          "User needs to subscribe to a plan first (User ID: " + userId + ")",
        );
      }
    } else {
      this._logger.info(
        `Found subscription: ${subscription.id} with status: ${subscription.status}`,
      );
      const plan = await this._planRepo.findById(subscription.planId);
      if (!plan) {
        throw new EntityNotFoundError("Plan Not Found", subscription.planId);
      }
      limit = plan.limits?.projects ?? PLAN_DEFAULTS.PROJECT_LIMIT;
    }

    // Limit Check
    if (limit !== -1) {
      const count = await this._projectRepo.countByOrg(orgId);
      if (count >= limit) {
        this._logger.warn(
          `Project creation failed: Limit reached for Org ${orgId} (Limit: ${limit}, Current: ${count})`,
        );
        throw new QuotaExceededError("Project Limit reached for this plan");
      }
    }

    this._logger.info(`Creating project '${data.name}' for Org ${orgId}`);

    const project = await this._projectRepo.create({
      orgId,
      name: data.name,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      status: "ACTIVE",
      priority: data.priority,
      tags: data.tags,
      teamMemberIds: data.teamMemberIds,
      tasksPerWeek: data.tasksPerWeek,
    });

    // Validate that all assigned team members belong to this organization
    if (project.teamMemberIds && project.teamMemberIds.length > 0) {
      await this._securityService.validateMembersBelongToOrg(
        project.teamMemberIds,
        orgId,
      );
    }

    // [NEW] Real-time & Notifications

    // 1. Notify Org Managers (Manager Dashboard Live Update)
    this._socketService.emitToRoleInOrg(
      orgId,
      UserRole.ORG_MANAGER,
      "project:created",
      project,
    );

    // 2. Notify Assigned Team Members
    if (project.teamMemberIds && project.teamMemberIds.length > 0) {
      const creator = await this._userRepo.findById(userId);
      const creatorName = creator
        ? creator.firstName || creator.name
        : "Manager";

      for (const memberId of project.teamMemberIds) {
        // A. Real-time update to Member Dashboard
        this._socketService.emitToUser(memberId, "project:assigned", project);

        // B. Persistent Notification
        await this._createNotificationUseCase.execute(
          memberId,
          "New Project Assigned",
          `You have been added to project '${project.name}' by ${creatorName}`,
          NotificationType.INFO,
          `/member/projects/${project.id}`,
        );
      }
    }

    return project;
  }
}
