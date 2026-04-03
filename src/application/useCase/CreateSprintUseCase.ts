import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IProjectRepo } from "../../application/interface/repositories/IProjectRepo";
import { ISprintRepo } from "../../application/interface/repositories/ISprintRepo";
import { Sprint } from "../../domain/entities/Sprint";
import { ValidationError } from "../../domain/errors/CommonErrors";
import { ILogger } from "../../application/interface/services/ILogger";
import { IAuthValidationService } from "../../application/interface/services/IAuthValidationService";
import { ISecurityService } from "../../application/interface/services/ISecurityService";
import { ICreateSprintUseCase } from "../interface/useCases/ICreateSprintUseCase";
import { ISprintDomainService } from "../../domain/interface/services/ISprintDomainService";
import { ISocketService } from "../../application/interface/services/ISocketService";
import { INotificationService } from "../../domain/interface/services/INotificationService";
import { NotificationType } from "../../domain/enums/NotificationType";
import { UserRole } from "../../domain/enums/UserRole";

@injectable()
export class CreateSprintUseCase implements ICreateSprintUseCase {
  constructor(
    @inject(TYPES.ISprintRepo) private _sprintRepo: ISprintRepo,
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.IAuthValidationService)
    private _authValidationService: IAuthValidationService,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
    @inject(TYPES.ISprintDomainService)
    private _sprintDomainService: ISprintDomainService,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
    @inject(TYPES.INotificationService)
    private _notificationService: INotificationService,
  ) {}

  async execute(data: Partial<Sprint>, requesterId: string): Promise<Sprint> {
    if (!data.projectId) throw new ValidationError("Project ID is required");
    this._logger.info(
      `Creating new sprint in project ${data.projectId} by user ${requesterId}`,
    );
    if (!data.startDate || !data.endDate) {
      throw new ValidationError("Start Date and End Date are required");
    }

    const project = await this._projectRepo.findById(data.projectId);
    if (!project) {
      throw new ValidationError("Project not found");
    }

    // RBAC Check
    await this._securityService.validateOrgManager(requesterId, project.orgId);

    const sprintStart = new Date(data.startDate);
    const sprintEnd = new Date(data.endDate);
    const projectEnd = new Date(project.endDate);
    const projectStart = project.startDate ? new Date(project.startDate) : null;

    this._authValidationService.validateSprintDates(
      sprintStart,
      sprintEnd,
      projectStart,
      projectEnd,
    );

    // [SCURM] Domain Rule: Timebox (1-28 days)
    this._sprintDomainService.validateTimebox(sprintStart, sprintEnd);

    const getWeekRangeLocal = (): { start: Date; end: Date } => {
      const now = new Date();
      const day = now.getDay(); // 0=Sun..6=Sat (local)
      const diffToMonday = (day === 0 ? -6 : 1) - day;

      const start = new Date(now);
      start.setDate(now.getDate() + diffToMonday);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      return { start, end };
    };

    const { start, end } = getWeekRangeLocal();
    const weeklyCount = await this._sprintRepo.countByProjectAndDateRange(
      data.projectId,
      start,
      end,
    );

    if (weeklyCount >= 5) {
      throw new ValidationError(
        "Weekly sprint creation limit reached (max 5 sprints per week).",
      );
    }

    const sprintData = {
      ...data,
      status: data.status || "PLANNED",
    };

    const newSprint = await this._sprintRepo.create(sprintData);

    // 1. Notify Managers in Org
    this._socketService.emitToRoleInOrg(
      project.orgId,
      UserRole.ORG_MANAGER,
      "sprint:created",
      newSprint,
    );

    // 2. Notify Members of the Project
    if (project.teamMemberIds && project.teamMemberIds.length > 0) {
      this._socketService.emitToProject(
        project.id,
        "sprint:created",
        newSprint,
      );

      // (Optional) Systematic Notification for serious planning
      for (const memberId of project.teamMemberIds) {
        if (memberId === requesterId) continue;
        await this._notificationService.sendSystemNotification(
          memberId,
          "New Sprint Planned",
          `A new sprint '${newSprint.name}' has been created in project ${project.name}`,
          NotificationType.INFO,
          project.orgId,
          `/member/projects/${project.id}`,
        );
      }
    }

    return newSprint;
  }
}
