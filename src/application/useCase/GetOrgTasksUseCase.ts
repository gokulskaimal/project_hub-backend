import { injectable, inject } from "inversify";
import { ITaskRepo } from "../../application/interface/repositories/ITaskRepo";
import { TYPES } from "../../infrastructure/container/types";
import { IGetOrgTasksUseCase } from "../interface/useCases/IGetOrgTasksUseCase";
import { Task } from "../../domain/entities/Task";
import { ILogger } from "../../application/interface/services/ILogger";
import { ISecurityService } from "../../application/interface/services/ISecurityService";

@injectable()
export class GetOrgTasksUseCase implements IGetOrgTasksUseCase {
  constructor(
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(orgId: string, requesterId: string): Promise<Task[]> {
    this._logger.info(
      `Fetching tasks for organization: ${orgId} (Requested by: ${requesterId})`,
    );
    await this._securityService.validateOrgAccess(requesterId, orgId);
    return this._taskRepo.findByOrganization(orgId);
  }

  async executePaginated(
    orgId: string,
    limit: number,
    offset: number,
  ): Promise<{ tasks: Task[]; total: number }> {
    const [tasks, total] = await Promise.all([
      this._taskRepo.findPaginatedByOrg(orgId, limit, offset),
      this._taskRepo.countByOrg(orgId),
    ]);
    return { tasks, total };
  }
}
