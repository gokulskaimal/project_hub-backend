import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../infrastructure/container/types";
import { ICreateProjectUseCase } from "../../../application/interface/useCases/ICreateProjectUseCase";
import { IGetProjectUseCase } from "../../../application/interface/useCases/IGetProjectUseCase";
import { IGetProjectByIdUseCase } from "../../../application/interface/useCases/IGetProjectByIdUseCase";
import { IGetProjectVelocityUseCase } from "../../../application/interface/useCases/IGetProjectVelocityUseCase";
import { IUpdateProjectUseCase } from "../../../application/interface/useCases/IUpdateProjectUseCase";
import { IDeleteProjectUseCase } from "../../../application/interface/useCases/IDeleteProjectUseCase";
import { AuthenticatedRequest } from "../../middleware/types/AuthenticatedRequest";
import { asyncHandler } from "../../middleware/ErrorMiddleware";
import { StatusCodes } from "../../../infrastructure/config/statusCodes.enum";
import { ValidationError } from "../../../domain/errors/CommonErrors";
import { toProjectDTO } from "../../../application/dto/ProjectDTO";
import { toVelocityDTO } from "../../../application/dto/AnalyticsDTO";
import { toUserDTO } from "../../../application/dto/UserDTO";
import {
  ProjectCreateSchema,
  ProjectUpdateSchema,
} from "../../../application/dto/ValidationSchemas";
import { z } from "zod";

import { ILogger } from "../../../infrastructure/interface/services/ILogger";
import { IUserRepo } from "../../../infrastructure/interface/repositories/IUserRepo";

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
    @inject(TYPES.IGetProjectVelocityUseCase)
    private _getProjectVelocityUC: IGetProjectVelocityUseCase,
    @inject(TYPES.IUpdateProjectUseCase)
    private _updateProjectUC: IUpdateProjectUseCase,
    @inject(TYPES.IDeleteProjectUseCase)
    private _deleteProjectUC: IDeleteProjectUseCase,
    @inject(TYPES.IGetMemberProjectsUseCase)
    private _getMemberProjectsUC: IGetMemberProjectsUseCase,
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
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

  createProject = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user || !authReq.user.orgId)
      throw new ValidationError("Unauthorized: Missing user context");

    const validation = ProjectCreateSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Validation Error",
        errors: validation.error.format(),
      });
      return;
    }

    const data = validation.data;
    this._logger.info(
      `Creating project '${data.name}' for Org ${authReq.user.orgId}`,
    );
    const project = await this._createProjectUC.execute(
      authReq.user.id,
      authReq.user.orgId,
      data,
    );
    this.sendSuccess(
      res,
      toProjectDTO(project),
      "Project created",
      StatusCodes.CREATED,
    );
  });

  getAllProjects = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user || !authReq.user.orgId)
      throw new ValidationError("Unauthorized: Missing user context");
    this._logger.info(`Fetching projects for Org ${authReq.user.orgId}`);
    const projects = await this._getProjectUC.execute(
      authReq.user.orgId,
      authReq.user.id,
    );
    this.sendSuccess(res, projects.map(toProjectDTO));
  });

  getMyProjects = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;
    if (!userId)
      throw new ValidationError("Unauthorized: Missing user context");

    this._logger.info(`Fetching projects for user ${userId}`);
    const projects = await this._getMemberProjectsUC.execute(
      userId,
      authReq.user!.id,
    );
    this.sendSuccess(res, projects.map(toProjectDTO));
  });

  getProjectById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    this._logger.info(`Fetching project ${id}`);
    const project = await this._getProjectByIdUC.execute(id, authReq.user!.id);

    if (!project) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, message: "Project not found" });
      return;
    }

    this.sendSuccess(res, toProjectDTO(project));
  });

  updateProject = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) throw new ValidationError("Unauthorized");
    const { id } = req.params;

    const validation = ProjectUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Validation Error",
        errors: validation.error.format(),
      });
      return;
    }

    this._logger.info(`Updating project ${id}`);
    const project = await this._updateProjectUC.execute(
      id,
      validation.data,
      authReq.user.id,
    );
    this.sendSuccess(res, toProjectDTO(project), "Project updated");
  });

  deleteProject = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) throw new ValidationError("Unauthorized");

    this._logger.info(`Deleting project ${id}`);
    await this._deleteProjectUC.execute(id, authReq.user.id);
    this.sendSuccess(res, null, "Project deleted successfully");
  });

  getProjectVelocity = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;

    const parsed = z
      .object({ days: z.coerce.number().int().min(1).max(365).optional() })
      .safeParse(req.query);
    if (!parsed.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Validation Error",
        errors: parsed.error.format(),
      });
      return;
    }

    const days = parsed.data.days ?? 7;
    const result = await this._getProjectVelocityUC.execute(
      id,
      days,
      authReq.user!.id,
    );
    this.sendSuccess(res, toVelocityDTO(result));
  });

  getProjectMembers = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    this._logger.info(`Fetching members for project ${id}`);

    const project = await this._getProjectByIdUC.execute(id, authReq.user!.id);
    if (!project) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Project not found",
      });
      return;
    }

    const members = await this._userRepo.findByIds(project.teamMemberIds || []);
    this.sendSuccess(res, members.map(toUserDTO));
  });
}
