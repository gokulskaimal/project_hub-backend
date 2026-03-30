import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ISprintRepo } from "../../application/interface/repositories/ISprintRepo";
import { ITaskRepo } from "../../application/interface/repositories/ITaskRepo";
import { IProjectRepo } from "../../application/interface/repositories/IProjectRepo";
import { Sprint } from "../../domain/entities/Sprint";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";
import { ILogger } from "../../application/interface/services/ILogger";
import { IUpdateSprintUseCase } from "../interface/useCases/IUpdateSprintUseCase";
import { IAuthValidationService } from "../../application/interface/services/IAuthValidationService";
import { ISecurityService } from "../../application/interface/services/ISecurityService";
import { ISprintDomainService } from "../../domain/interface/services/ISprintDomainService";

@injectable()
export class UpdateSprintUseCase implements IUpdateSprintUseCase {
  constructor(
    @inject(TYPES.ISprintRepo) private _sprintRepo: ISprintRepo,
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.IAuthValidationService)
    private _authValidationService: IAuthValidationService,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
    @inject(TYPES.ISprintDomainService)
    private _sprintDomainService: ISprintDomainService,
  ) {}

  async execute(
    id: string,
    updateData: Partial<Sprint>,
    requesterId: string,
  ): Promise<Sprint> {
    this._logger.info(`Updating sprint ${id} by user ${requesterId}`);

    const sprint = await this._sprintRepo.findById(id);
    if (!sprint) throw new EntityNotFoundError("Sprint", id);

    // RBAC Check
    const projectCheck = await this._projectRepo.findById(sprint.projectId);
    if (!projectCheck)
      throw new EntityNotFoundError("Project", sprint.projectId);
    await this._securityService.validateOrgManager(
      requesterId,
      projectCheck.orgId,
    );

    // [SCURM] Domain Rule: Immutability (Completed sprints are locked)
    if (sprint.status === "COMPLETED") {
      try {
        await this._securityService.validateSuperAdmin(requesterId);
      } catch {
        throw new Error("Completed sprints are locked and cannot be modified.");
      }
    }

    if (updateData.startDate || updateData.endDate) {
      const project = await this._projectRepo.findById(sprint.projectId);
      if (project) {
        const sprintStart = updateData.startDate
          ? new Date(updateData.startDate)
          : new Date(sprint.startDate);
        const sprintEnd = updateData.endDate
          ? new Date(updateData.endDate)
          : new Date(sprint.endDate);

        const projectEnd = new Date(project.endDate);
        const projectStart = project.startDate
          ? new Date(project.startDate)
          : null;

        this._authValidationService.validateSprintDates(
          sprintStart,
          sprintEnd,
          projectStart,
          projectEnd,
        );

        // [SCURM] Domain Rule: Timebox (1-28 days)
        this._sprintDomainService.validateTimebox(sprintStart, sprintEnd);
      }
    }

    // [SCURM] Domain Rule: Validate Sprint Start (Cannot start tanpa goal)
    if (updateData.status === "ACTIVE" && sprint.status !== "ACTIVE") {
      this._sprintDomainService.validateSprintStart({
        ...sprint,
        ...updateData,
      } as Sprint);
    }

    const updatedSprint = await this._sprintRepo.update(id, updateData);
    if (!updatedSprint) throw new EntityNotFoundError("Sprint", id);

    if (updateData.status === "COMPLETED") {
      const tasks = await this._taskRepo.findAll({ sprintId: id });
      const unfinishedTasks = tasks.filter((t) => t.status !== "DONE");

      await Promise.all(
        unfinishedTasks.map((t) => {
          let updatedTotalTime = t.totalTimeSpent || 0;
          const updatedLogs = t.timeLogs ? [...t.timeLogs] : [];

          t.timeLogs?.forEach((log, index) => {
            if (!log.endTime) {
              const now = new Date();
              log.endTime = now;
              log.duration = now.getTime() - new Date(log.startTime).getTime();
              updatedTotalTime += log.duration;
              updatedLogs[index] = log;
            }
          });

          return this._taskRepo.update(t.id, {
            sprintId: null, // Move unfinished items back to Backlog
            timeLogs: updatedLogs,
            totalTimeSpent: updatedTotalTime,
          });
        }),
      );
    }

    return updatedSprint;
  }
}
