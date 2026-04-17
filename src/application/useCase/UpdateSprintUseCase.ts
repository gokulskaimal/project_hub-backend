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
import { IEventDispatcher } from "../interface/services/IEventDispatcher";
import { SPRINT_EVENTS } from "../events/SprintEvents";

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
    @inject(TYPES.IEventDispatcher) private _eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    id: string,
    updateData: Partial<Sprint>,
    requesterId: string,
  ): Promise<Sprint> {
    this._logger.info(`Updating sprint ${id} by user ${requesterId}`);

    const oldSprint = await this._sprintRepo.findById(id);
    if (!oldSprint) throw new EntityNotFoundError("Sprint", id);

    const project = await this._projectRepo.findById(oldSprint.projectId);
    if (!project) throw new EntityNotFoundError("Project", oldSprint.projectId);

    await this._securityService.validateOrgManager(requesterId, project.orgId);

    // [SCURM] Domain Rule: Immutability (Completed sprints are locked)
    if (oldSprint.status === "COMPLETED") {
      try {
        await this._securityService.validateSuperAdmin(requesterId);
      } catch {
        throw new Error("Completed sprints are locked and cannot be modified.");
      }
    }

    if (updateData.startDate || updateData.endDate) {
      const sprintStart = updateData.startDate
        ? new Date(updateData.startDate)
        : new Date(oldSprint.startDate);
      const sprintEnd = updateData.endDate
        ? new Date(updateData.endDate)
        : new Date(oldSprint.endDate);

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

      this._sprintDomainService.validateTimebox(sprintStart, sprintEnd);
    }

    if (updateData.status === "ACTIVE") {
      if (oldSprint.status !== "ACTIVE") {
        this._sprintDomainService.validateSprintStart({
          ...oldSprint,
          ...updateData,
        } as Sprint);
      }
    }

    const updatedSprint = await this._sprintRepo.update(id, updateData);
    if (!updatedSprint) throw new EntityNotFoundError("Sprint", id);

    // DISPATCH EVENT - Side effects handled in SprintEventSubscriber
    this._eventDispatcher.dispatch(SPRINT_EVENTS.UPDATED, {
      oldSprint,
      updatedSprint,
      updaterId: requesterId,
      changes: updateData,
    });

    if (updateData.status === "COMPLETED") {
      const tasks = await this._taskRepo.findAll({ sprintId: id });
      const unfinishedTasksCount = tasks.filter(
        (t) => t.status !== "DONE" && t.type !== "EPIC",
      ).length;

      if (unfinishedTasksCount > 0) {
        throw new Error(
          `Cannot complete sprint: There are ${unfinishedTasksCount} task(s) that are not 'DONE'. Please complete all tasks or move them out of the sprint first.`,
        );
      }
    }

    return updatedSprint;
  }
}
