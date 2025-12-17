import { injectable, inject } from "inversify";
import { IProjectRepo } from "../../infrastructure/interface/repositories/IProjectRepo";
import { TYPES } from "../../infrastructure/container/types";
import { ISubscriptionRepo } from "../../infrastructure/interface/repositories/ISubscriptionRepo";
import { IPlanRepo } from "../../infrastructure/interface/repositories/IPlanRepo";
import { ICreateProjectUseCase } from "../interface/useCases/ICreateProjectUseCase";
import { Project } from "../../domain/entities/Project";
import { QuotaExceededError, EntityNotFoundError } from '../../domain/errors/CommonErrors'

import { ILogger } from "../../infrastructure/interface/services/ILogger";

@injectable()

export class CreateProjectUseCase implements ICreateProjectUseCase {

    constructor(
        @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
        @inject(TYPES.ISubscriptionRepo) private _subRepo: ISubscriptionRepo,
        @inject(TYPES.IPlanRepo) private _planRepo: IPlanRepo,
        @inject(TYPES.ILogger) private _logger: ILogger
    ) { }


    async execute(userId: string, orgId: string, data: Partial<Project>): Promise<Project> {
        this._logger.info(`Checking subscription for userId: ${userId}`);
        
        let limit = 1; // Default
        const subscription = await this._subRepo.findByUserId(userId);

        if (!subscription || subscription.status !== 'active') {
            this._logger.warn(`No subscription found for userId: ${userId}. Attempting to use Free Plan limits.`);
            // Fallback: Find a Free Plan (price == 0)
            const freePlans = await this._planRepo.findAll({ isActive: true }); 
            const freePlan = freePlans.find(p => p.price === 0);

            if (freePlan) {
                 this._logger.info(`Using Free Plan limits: ${freePlan.name} (Limit: ${freePlan.limits?.projects})`);
                 limit = freePlan.limits?.projects ?? 1;
            } else {
                 this._logger.error("No free plan found in system to fallback to.");
                 throw new EntityNotFoundError("User needs to subscribe to a plan first (User ID: " + userId + ")");
            }
        } else {
            this._logger.info(`Found subscription: ${subscription.id} with status: ${subscription.status}`);
            const plan = await this._planRepo.findById(subscription.planId);
            if (!plan) {
                throw new EntityNotFoundError('Plan Not Found', subscription.planId);
            }
            limit = plan.limits?.projects ?? 1;
        }

        // Limit Check
        if (limit !== -1) {
            const count = await this._projectRepo.countByOrg(orgId)
            if (count >= limit) {
                this._logger.warn(`Project creation failed: Limit reached for Org ${orgId} (Limit: ${limit}, Current: ${count})`);
                throw new QuotaExceededError('Project Limit reached for this plan')
            }
        }

        this._logger.info(`Creating project '${data.name}' for Org ${orgId}`);

        const project = await this._projectRepo.create({
            orgId,
            name : data.name,
            description : data.description,
            startDate : data.startDate,
            endDate  : data.endDate,
            status : 'ACTIVE',
            priority: data.priority,
            tags: data.tags,
            teamMemberIds: data.teamMemberIds
        })
        return project
    }


}