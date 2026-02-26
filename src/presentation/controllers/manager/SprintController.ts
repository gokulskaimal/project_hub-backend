import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../infrastructure/container/types";
import { ISprintRepo } from "../../../infrastructure/interface/repositories/ISprintRepo";
import { ITaskRepo } from "../../../infrastructure/interface/repositories/ITaskRepo";
import { ICreateSprintUseCase } from "../../../application/interface/useCases/ICreateSprintUseCase";
import { IUpdateSprintUseCase } from "../../../application/interface/useCases/IUpdateSprintUseCase";
import { IDeleteSprintUseCase } from "../../../application/interface/useCases/IDeleteSprintUseCase";
import { IGetProjectSprintsUseCase } from "../../../application/interface/useCases/IGetProjectSprintsUseCase";
import { Sprint } from "../../../domain/entities/Sprint";
import { asyncHandler } from "../../middleware/ErrorMiddleware";
import { StatusCodes } from "../../../infrastructure/config/statusCodes.enum";

import { ILogger } from "../../../infrastructure/interface/services/ILogger";
import { AuthenticatedRequest } from "../../middleware/types/AuthenticatedRequest";
import { UserRole } from "../../../domain/enums/UserRole";
import { SprintCreateSchema } from "../../../application/dto/ValidationSchemas";

@injectable()
export class SprintController {
  constructor(
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.ISprintRepo) private _sprintRepo: ISprintRepo,
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.ICreateSprintUseCase)
    private _createSprintUC: ICreateSprintUseCase,
    @inject(TYPES.IUpdateSprintUseCase)
    private _updateSprintUC: IUpdateSprintUseCase,
    @inject(TYPES.IDeleteSprintUseCase)
    private _deleteSprintUC: IDeleteSprintUseCase,
    @inject(TYPES.IGetProjectSprintsUseCase)
    private _getProjectSprintsUC: IGetProjectSprintsUseCase,
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

    const validation = SprintCreateSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Validation Error",
        errors: validation.error.format(),
      });
      return;
    }

    const validatedData = validation.data;

    const sprint = await this._createSprintUC.execute({
      projectId: validatedData.projectId,
      name: validatedData.name,
      description: validatedData.description || "",
      startDate: new Date(validatedData.startDate),
      endDate: new Date(validatedData.endDate),
      goal: validatedData.goal,
      status: "PLANNED",
    });

    res.status(StatusCodes.CREATED).json({ success: true, data: sprint });
  });

  getProjectSprints = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const sprints = await this._getProjectSprintsUC.execute(projectId);
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
    const { status, goal, startDate, endDate } = req.body;

    const updateData: Partial<Sprint> = {};
    if (status) updateData.status = status;
    if (goal) updateData.goal = goal;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);

    const updatedSprint = await this._updateSprintUC.execute(id, updateData);

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

    await this._deleteSprintUC.execute(id);

    res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Sprint deleted successfully" });
  });
}
