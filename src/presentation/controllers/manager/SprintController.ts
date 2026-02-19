import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../infrastructure/container/types";
import { ISprintRepo } from "../../../infrastructure/interface/repositories/ISprintRepo";
import { ITaskRepo } from "../../../infrastructure/interface/repositories/ITaskRepo"; // <--- NEW IMPORT
import { asyncHandler } from "../../middleware/ErrorMiddleware";
import { StatusCodes } from "../../../infrastructure/config/statusCodes.enum";
import {
  ValidationError,
  EntityNotFoundError,
} from "../../../domain/errors/CommonErrors";
import { ILogger } from "../../../infrastructure/interface/services/ILogger";
import { AuthenticatedRequest } from "../../middleware/types/AuthenticatedRequest";
import { UserRole } from "../../../domain/enums/UserRole";

@injectable()
export class SprintController {
  constructor(
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.ISprintRepo) private _sprintRepo: ISprintRepo,
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
  ) {}

  createSprint = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    if (
      authReq.user?.role !== UserRole.ORG_MANAGER &&
      authReq.user?.role !== UserRole.SUPER_ADMIN
    ) {
      res
        .status(StatusCodes.FORBIDDEN)
        .json({ success: false, message: "Access denied. Managers only." });
      return;
    }

    const { projectId, name, startDate, endDate, goal, description } = req.body;
    if (!projectId || !name || !startDate || !endDate)
      throw new ValidationError("Missing required fields");

    const sprint = await this._sprintRepo.create({
      projectId,
      name,
      description: description || "",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      goal,
      status: "PLANNED",
    });

    res.status(StatusCodes.CREATED).json({ success: true, data: sprint });
  });

  getProjectSprints = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const sprints = await this._sprintRepo.findByProject(projectId);
    res.status(StatusCodes.OK).json({ success: true, data: sprints });
  });

  updateSprint = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    if (
      authReq.user?.role !== UserRole.ORG_MANAGER &&
      authReq.user?.role !== UserRole.SUPER_ADMIN
    ) {
      res
        .status(StatusCodes.FORBIDDEN)
        .json({ success: false, message: "Access denied. Managers only." });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    // 1. Update the Sprint
    const updatedSprint = await this._sprintRepo.update(id, req.body);
    if (!updatedSprint) throw new EntityNotFoundError("Sprint", id);

    // 2. If Sprint is COMPLETED, move unfinished tasks to Backlog
    if (status === "COMPLETED") {
      // Find all tasks in this sprint
      const tasks = await this._taskRepo.findAll({ sprintId: id });

      // Filter for unfinished tasks (Not DONE)
      const unfinishedTasks = tasks.filter((t) => t.status !== "DONE");

      // Move them to Backlog (sprintId: null)
      await Promise.all(
        unfinishedTasks.map((t) =>
          this._taskRepo.update(t.id, { sprintId: null }),
        ),
      );
    }

    res.status(StatusCodes.OK).json({ success: true, data: updatedSprint });
  });

  deleteSprint = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    if (
      authReq.user?.role !== UserRole.ORG_MANAGER &&
      authReq.user?.role !== UserRole.SUPER_ADMIN
    ) {
      res
        .status(StatusCodes.FORBIDDEN)
        .json({ success: false, message: "Access denied. Managers only." });
      return;
    }

    const { id } = req.params;
    const sprint = await this._sprintRepo.findById(id);
    if (!sprint) {
      throw new EntityNotFoundError("Sprint", id);
    }

    const tasks = await this._taskRepo.findAll({ sprintId: id });
    await Promise.all(
      tasks.map((t) => this._taskRepo.update(t.id, { sprintId: null })),
    );

    await this._sprintRepo.delete(id);

    res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Sprint deleted successfully" });
  });
}
