import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IProjectRepo } from "../../application/interface/repositories/IProjectRepo";
import { IDeleteProjectUseCase } from "../interface/useCases/IDeleteProjectUseCase";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";
import { ILogger } from "../../application/interface/services/ILogger";
import { ISprintRepo } from "../../application/interface/repositories/ISprintRepo";
import { ITaskRepo } from "../../application/interface/repositories/ITaskRepo";
import { ITaskHistoryRepo } from "../../application/interface/repositories/ITaskHistoryRepo";
import { IChatRepo } from "../../application/interface/repositories/IChatRepo";
import { ISecurityService } from "../../application/interface/services/ISecurityService";
import { IFileService } from "../../application/interface/services/IFileService";

@injectable()
export class DeleteProjectUseCase implements IDeleteProjectUseCase {
  constructor(
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.ISprintRepo) private _sprintRepo: ISprintRepo,
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.ITaskHistoryRepo) private _taskHistoryRepo: ITaskHistoryRepo,
    @inject(TYPES.IChatRepo) private _chatRepo: IChatRepo,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
    @inject(TYPES.IFileService) private _fileService: IFileService,
  ) {}

  async execute(id: string, requesterId: string): Promise<boolean> {
    this._logger.info(
      `Deleting project ${id} and all related data by user ${requesterId}`,
    );

    const project = await this._projectRepo.findById(id);
    if (!project) throw new EntityNotFoundError("Project", id);

    // RBAC Check
    await this._securityService.validateOrgManager(requesterId, project.orgId);

    this._logger.info(
      `Bulk deleting all tasks and related data for project ${id}`,
    );

    const projectTasks = await this._taskRepo.findByProject(id);
    const taskIds = projectTasks.map((t) => t.id);
    const attachmentUrls = projectTasks.flatMap(
      (t) => t.attachments?.map((a) => a.url) || [],
    );

    await Promise.all([
      this._taskRepo.deleteMany({ projectId: id }),
      this._taskHistoryRepo.deleteMany({ taskId: { $in: taskIds } }),
      this._sprintRepo.deleteMany({ projectId: id }),
      this._chatRepo.deleteByProject(id),
      ...attachmentUrls.map((url) => this._fileService.deleteFile(url)),
    ]);

    const success = await this._projectRepo.delete(id);
    if (!success) throw new EntityNotFoundError("Project", id);

    return true;
  }
}
