import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../infrastructure/container/types";
import { ISprintRepo } from "../../../application/interface/repositories/ISprintRepo";
import { ITaskRepo } from "../../../application/interface/repositories/ITaskRepo";
import { ICreateSprintUseCase } from "../../../application/interface/useCases/ICreateSprintUseCase";
import { IUpdateSprintUseCase } from "../../../application/interface/useCases/IUpdateSprintUseCase";
import { IDeleteSprintUseCase } from "../../../application/interface/useCases/IDeleteSprintUseCase";
import { IGetProjectSprintsUseCase } from "../../../application/interface/useCases/IGetProjectSprintsUseCase";
import { Sprint } from "../../../domain/entities/Sprint";
import { asyncHandler } from "../../middleware/ErrorMiddleware";
import { StatusCodes } from "../../../infrastructure/config/statusCodes.enum";

import { ILogger } from "../../../application/interface/services/ILogger";
import { AuthenticatedRequest } from "../../middleware/types/AuthenticatedRequest";
import { UserRole } from "../../../domain/enums/UserRole";
import { SprintCreateSchema } from "../../../application/dto/ValidationSchemas";
import {
  toSprintDTO,
  toSprintDTOArray,
} from "../../../application/dto/SprintDTO";

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

  private sendSuccess<T>(
    res: Response,
    data: T,
    message: string = "Success",
    status: number = StatusCodes.OK,
  ): void {
    res.status(status).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

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
    const sprint = await this._createSprintUC.execute(
      {
        projectId: validatedData.projectId,
        name: validatedData.name,
        description: validatedData.description || "",
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        goal: validatedData.goal || undefined,
        status: "PLANNED",
      },
      authReq.user!.id,
    );

    this.sendSuccess(
      res,
      toSprintDTO(sprint),
      "Sprint created",
      StatusCodes.CREATED,
    );
  });

  getProjectSprints = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const authReq = req as AuthenticatedRequest;
    const sprints = await this._getProjectSprintsUC.execute(
      projectId,
      authReq.user!.id,
    );
    this.sendSuccess(res, toSprintDTOArray(sprints));
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
    const { name, status, goal, startDate, endDate } = req.body;

    const updateData: Partial<Sprint> = {};
    if (name) updateData.name = name;
    if (status) updateData.status = status;
    if (goal) updateData.goal = goal;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);

    const updatedSprint = await this._updateSprintUC.execute(
      id,
      updateData,
      authReq.user!.id,
    );
    this.sendSuccess(res, toSprintDTO(updatedSprint), "Sprint updated");
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
    await this._deleteSprintUC.execute(id, authReq.user!.id);
    this.sendSuccess(res, null, "Sprint deleted successfully");
  });
}
