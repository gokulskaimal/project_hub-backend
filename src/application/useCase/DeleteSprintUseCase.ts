import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ISprintRepo } from "../../application/interface/repositories/ISprintRepo";
import { ITaskRepo } from "../../application/interface/repositories/ITaskRepo";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";
import { ILogger } from "../../application/interface/services/ILogger";
import { IDeleteSprintUseCase } from "../interface/useCases/IDeleteSprintUseCase";
import { ISecurityService } from "../../application/interface/services/ISecurityService";
import { IProjectRepo } from "../../application/interface/repositories/IProjectRepo";
import { ISocketService } from "../../application/interface/services/ISocketService";
import { INotificationService } from "../../domain/interface/services/INotificationService";
import { NotificationType } from "../../domain/enums/NotificationType";
import { UserRole } from "../../domain/enums/UserRole";

@injectable()
export class DeleteSprintUseCase implements IDeleteSprintUseCase {
  constructor(
    @inject(TYPES.ISprintRepo) private _sprintRepo: ISprintRepo,
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
    @inject(TYPES.INotificationService)
    private _notificationService: INotificationService,
  ) {}

  async execute(id: string, requesterId: string): Promise<boolean> {
    this._logger.info(`Deleting sprint ${id} by user ${requesterId}`);

    const sprint = await this._sprintRepo.findById(id);
    if (!sprint) {
      throw new EntityNotFoundError("Sprint", id);
    }

    // RBAC Check
    const project = await this._projectRepo.findById(sprint.projectId);
    if (!project) throw new EntityNotFoundError("Project", sprint.projectId);
    await this._securityService.validateOrgManager(requesterId, project.orgId);

    // Unassign tasks mapped to this sprint
    const tasks = await this._taskRepo.findAll({ sprintId: id });
    await Promise.all(
      tasks.map((t) => this._taskRepo.update(t.id, { sprintId: null })),
    );

    await this._sprintRepo.delete(id);

    // 1. Notify Managers in Org
    this._socketService.emitToRoleInOrg(
      project.orgId,
      UserRole.ORG_MANAGER,
      "sprint:deleted",
      id,
    );

    // 2. Notify Members of the Project
    if (project.teamMemberIds && project.teamMemberIds.length > 0) {
      this._socketService.emitToProject(project.id, "sprint:deleted", id);

      for (const memberId of project.teamMemberIds) {
        if (memberId === requesterId) continue;
        await this._notificationService.sendSystemNotification(
          memberId,
          "Sprint Deleted",
          `Sprint '${sprint.name}' in project ${project.name} has been deleted.`,
          NotificationType.WARNING,
          project.orgId,
          `/member/projects/${project.id}`,
        );
      }
    }

    return true;
  }
}
