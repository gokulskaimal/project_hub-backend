import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IGetMemberTasksUseCase } from "../interface/useCases/IGetMemberTasksUseCase";
import { ITaskRepo } from "../../application/interface/repositories/ITaskRepo";
import { Task } from "../../domain/entities/Task";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { ISecurityService } from "../../application/interface/services/ISecurityService";

@injectable()
export class GetMemberTasksUseCase implements IGetMemberTasksUseCase {
  constructor(
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(userId: string, requesterId: string): Promise<Task[]> {
    const user = await this._userRepo.findById(userId);
    if (!user) return [];

    if (!user.orgId) return [];

    // Validate requester belongs to the same org
    await this._securityService.validateOrgAccess(requesterId, user.orgId);

    return await this._taskRepo.findByAssignee(userId);
  }

  async executePaginated(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<{ tasks: Task[]; total: number }> {
    const [tasks, total] = await Promise.all([
      this._taskRepo.findPaginatedByAssignee(userId, limit, offset),
      this._taskRepo.countByAssignee(userId),
    ]);
    return { tasks, total };
  }
}
