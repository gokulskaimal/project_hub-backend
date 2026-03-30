import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { UserRole } from "../../domain/enums/UserRole";
import { ITaskRepo } from "../../application/interface/repositories/ITaskRepo";
import { ITaskHistoryRepo } from "../../application/interface/repositories/ITaskHistoryRepo";
import { IDeleteTaskUseCase } from "../interface/useCases/IDeleteTaskUseCase";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";
import { ILogger } from "../../application/interface/services/ILogger";
import { ISocketService } from "../../application/interface/services/ISocketService";
import { ICreateNotificationUseCase } from "../interface/useCases/ICreateNotificationUseCase";
import { ISecurityService } from "../../application/interface/services/ISecurityService";

@injectable()
export class DeleteTaskUseCase implements IDeleteTaskUseCase {
  constructor(
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.ITaskHistoryRepo) private _taskHistoryRepo: ITaskHistoryRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
    @inject(TYPES.ICreateNotificationUseCase)
    private _createNotificationUC: ICreateNotificationUseCase,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(id: string, requesterId: string): Promise<boolean> {
    this._logger.info(`Deleting task ${id}`);
    // 1. Fetch task to get details
    const task = await this._taskRepo.findById(id);
    if (!task) throw new EntityNotFoundError("Task Not Found", id);

    // RBAC Check
    if (task.orgId) {
      await this._securityService.validateOrgAccess(requesterId, task.orgId);
    }

    // 2. Delete task
    const success = await this._taskRepo.delete(id);
    if (!success) throw new EntityNotFoundError("Task Not Found", id);

    await this._taskRepo.deleteSubtasks(id);

    await this._taskHistoryRepo.deleteByTaskId(id);

    // 3. Notify Project & Managers (for Kanban refresh)
    if (task.orgId) {
      this._socketService.emitToProject(task.projectId, "task:deleted", id);
      this._socketService.emitToRoleInOrg(
        task.orgId,
        UserRole.ORG_MANAGER,
        "task:deleted",
        id,
      );
    }

    // 4. Notify Assignee
    if (task.assignedTo) {
      await this._createNotificationUC.execute(
        task.assignedTo,
        "Task Deleted",
        `Task '${task.title}' has been deleted.`,
        "WARNING",
        task.orgId || "",
      );
    }

    return true;
  }
}
