import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../infrastructure/container/types";
import { ICreateProjectUseCase } from "../../../application/interface/useCases/ICreateProjectUseCase";
import { IGetProjectUseCase } from "../../../application/interface/useCases/IGetProjectUseCase";
import { IGetProjectByIdUseCase } from "../../../application/interface/useCases/IGetProjectByIdUseCase";
import { IUpdateProjectUseCase } from "../../../application/interface/useCases/IUpdateProjectUseCase";
import { IDeleteProjectUseCase } from "../../../application/interface/useCases/IDeleteProjectUseCase";
import { AuthenticatedRequest } from "../../middleware/types/AuthenticatedRequest";
import { asyncHandler } from "../../middleware/ErrorMiddleware";
import { StatusCodes } from "../../../infrastructure/config/statusCodes.enum";
import { ValidationError } from "../../../domain/errors/CommonErrors";
import { toProjectDTO } from "../../../application/dto/ProjectDTO";

import { ILogger } from "../../../infrastructure/interface/services/ILogger";

import { IGetMemberProjectsUseCase } from "../../../application/interface/useCases/IGetMemberProjectsUseCase";

@injectable()
export class ProjectController {
  constructor(
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
    @inject(TYPES.ICreateProjectUseCase)
    private _createProjectUC: ICreateProjectUseCase,
    @inject(TYPES.IGetProjectUseCase) private _getProjectUC: IGetProjectUseCase,
    @inject(TYPES.IGetProjectByIdUseCase)
    private _getProjectByIdUC: IGetProjectByIdUseCase,
    @inject(TYPES.IUpdateProjectUseCase)
    private _updateProjectUC: IUpdateProjectUseCase,
    @inject(TYPES.IDeleteProjectUseCase)
    private _deleteProjectUC: IDeleteProjectUseCase,
    @inject(TYPES.IGetMemberProjectsUseCase)
    private _getMemberProjectsUC: IGetMemberProjectsUseCase,
  ) {}

  createProject = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user || !authReq.user.orgId)
      throw new ValidationError("Unauthorized: Missing user context");
    const {
      name,
      description,
      startDate,
      endDate,
      priority,
      tags,
      teamMemberIds,
    } = req.body;
    this._logger.info(`[CreateProject] Received Data:`, {
      name,
      priority,
      tags,
      teamMemberIds,
    });

    if (!name) throw new ValidationError("Name is required");

    this._logger.info(
      `Creating project '${name}' for Org ${authReq.user.orgId}`,
    );
    const project = await this._createProjectUC.execute(
      authReq.user.id,
      authReq.user.orgId,
      {
        name,
        description,
        startDate,
        endDate,
        priority,
        tags,
        teamMemberIds,
      },
    );
    this._logger.info(
      `[CreateProject] Created Project:`,
      project as unknown as Record<string, unknown>,
    );
    res
      .status(StatusCodes.CREATED)
      .json({ success: true, data: toProjectDTO(project) });
  });

  getAllProjects = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user || !authReq.user.orgId)
      throw new ValidationError("Unauthorized: Missing user context");
    this._logger.info(`Fetching projects for Org ${authReq.user.orgId}`);
    const projects = await this._getProjectUC.execute(authReq.user.orgId);
    res
      .status(StatusCodes.OK)
      .json({ success: true, data: projects.map(toProjectDTO) });
  });

  getMyProjects = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;
    if (!userId)
      throw new ValidationError("Unauthorized: Missing user context");

    this._logger.info(`Fetching projects for user ${userId}`);
    const projects = await this._getMemberProjectsUC.execute(userId);
    res
      .status(StatusCodes.OK)
      .json({ success: true, data: projects.map(toProjectDTO) });
  });

  getProjectById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this._logger.info(`Fetching project ${id}`);
    const project = await this._getProjectByIdUC.execute(id);

    if (!project) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, message: "Project not found" });
      return;
    }

    res
      .status(StatusCodes.OK)
      .json({ success: true, data: toProjectDTO(project) });
  });

  updateProject = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this._logger.info(`Updating project ${id}`);
    const project = await this._updateProjectUC.execute(id, req.body);
    res
      .status(StatusCodes.OK)
      .json({ success: true, data: toProjectDTO(project) });
  });

  deleteProject = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this._logger.info(`Deleting project ${id}`);
    await this._deleteProjectUC.execute(id);
    res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Project deleted successfully" });
  });
}
