import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ITaskRepo } from "../../application/interface/repositories/ITaskRepo";
import { ITaskHistoryRepo } from "../../application/interface/repositories/ITaskHistoryRepo";
import { IProjectRepo } from "../../application/interface/repositories/IProjectRepo";
import { IDeleteTaskUseCase } from "../interface/useCases/IDeleteTaskUseCase";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";
import { ILogger } from "../../application/interface/services/ILogger";
import { ISecurityService } from "../../application/interface/services/ISecurityService";
import { IFileService } from "../../application/interface/services/IFileService";
import { IEventDispatcher } from "../interface/services/IEventDispatcher";
import { TASK_EVENTS } from "../events/TaskEvents";

@injectable()
export class DeleteTaskUseCase implements IDeleteTaskUseCase {
  constructor(
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.ITaskHistoryRepo) private _taskHistoryRepo: ITaskHistoryRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.IEventDispatcher) private _eventDispatcher: IEventDispatcher,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
    @inject(TYPES.IFileService) private _fileService: IFileService,
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
  ) {}

  async execute(id: string, requesterId: string): Promise<boolean> {
    this._logger.info(`Deleting task ${id}`);
    // 1. Fetch task to get details
    const task = await this._taskRepo.findById(id);
    if (!task) throw new EntityNotFoundError("Task Not Found", id);

    // RBAC Check (Strict: Manager only for deletion)
    if (task.orgId) {
      await this._securityService.validateOrgManager(requesterId, task.orgId);
    }

    if (task.attachments && task.attachments.length > 0) {
      this._logger.info(
        `Cleaning up ${task.attachments.length} attachments for task ${id}`,
      );
      await Promise.all(
        task.attachments.map((attr) => this._fileService.deleteFile(attr.url)),
      );
    }

    // 2. Delete task
    const success = await this._taskRepo.delete(id);
    if (!success) throw new EntityNotFoundError("Task Not Found", id);

    await this._taskRepo.deleteSubtasks(id);

    await this._taskHistoryRepo.deleteByTaskId(id);

    // Dispatch Domain Event for side effects (Sockets, Notifications, History logging)
    await this._eventDispatcher.dispatch(TASK_EVENTS.DELETED, {
      taskId: id,
      projectId: task.projectId,
      orgId: task.orgId || "",
      deleterId: requesterId,
      taskTitle: task.title,
    });

    // Synchronize Denormalized Stats
    const project = await this._projectRepo.findById(task.projectId);
    if (project) {
      const totalTasks = Math.max(0, (project.totalTasks || 0) - 1);
      let completedTasks = project.completedTasks || 0;
      if (task.status === "DONE")
        completedTasks = Math.max(0, completedTasks - 1);

      const progress =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      await this._projectRepo.update(project.id, {
        totalTasks,
        completedTasks,
        progress,
      });
    }

    return true;
  }
}
