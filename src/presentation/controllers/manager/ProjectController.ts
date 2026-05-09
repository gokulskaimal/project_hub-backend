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
import { ResponseHandler } from "../../utils/ResponseHandler";
import { asyncHandler } from "../../../utils/asyncHandler";
import { ValidationError } from "../../../domain/errors/CommonErrors";
import { toProjectDTO } from "../../../application/dto/ProjectDTO";
import { toVelocityDTO } from "../../../application/dto/AnalyticsDTO";
import { toUserDTO } from "../../../application/dto/UserDTO";
import {
  ProjectCreateSchema,
  ProjectUpdateSchema,
} from "../../../application/dto/ValidationSchemas";
import { z } from "zod";

import { ILogger } from "../../../application/interface/services/ILogger";

import { IGetMemberProjectsUseCase } from "../../../application/interface/useCases/IGetMemberProjectsUseCase";
import { IGetProjectMembersUseCase } from "../../../application/interface/useCases/IGetProjectMembersUseCase";
import { IGetOrgAnalyticsUseCase } from "../../../application/interface/useCases/IGetOrgAnalyticsUseCase";

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
    @inject(TYPES.IGetProjectMembersUseCase)
    private _getProjectMembersUC: IGetProjectMembersUseCase,
    @inject(TYPES.IGetOrgAnalyticsUseCase)
    private _getOrgAnalyticsUC: IGetOrgAnalyticsUseCase,
  ) {}

  getEpicAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    this._logger.info(`Fetching epic analytics for project ${id}`);

    const stats = await this._getOrgAnalyticsUC.getEpicProgress(
      id,
      authReq.user!.id,
    );
    ResponseHandler.success(res, stats, "Epic analytics retrieved");
  });

  createProject = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user || !authReq.user.orgId)
      return ResponseHandler.unauthorized(
        res,
        "Unauthorized: Missing user context",
      );

    const validation = ProjectCreateSchema.safeParse(req.body);
    if (!validation.success) {
      return ResponseHandler.validationError(res, validation.error.format());
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
    ResponseHandler.created(res, toProjectDTO(project), "Project created");
  });

  getAllProjects = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;
    const { search = "", status = "ALL", priority = "ALL" } = req.query;
    const { projects, total } = await this._getProjectUC.executePaginated(
      limit,
      offset,
      {
        orgId: authReq.user!.orgId!,
        searchTerm: search as string,
        status: status as string,
        priority: priority as string,
      },
    );

    ResponseHandler.success(
      res,
      {
        items: projects.map(toProjectDTO),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      "Projects fetched successfully",
    );
  });

  getMyProjects = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;

    this._logger.info(`Fetching paginated projects for member ${userId}`);
    const { projects, total } =
      await this._getMemberProjectsUC.executePaginated(
        authReq.user!.id,
        limit,
        offset,
      );

    ResponseHandler.success(res, {
      items: projects.map(toProjectDTO),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  });

  getProjectById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    this._logger.info(`Fetching project ${id}`);
    const project = await this._getProjectByIdUC.execute(id, authReq.user!.id);

    if (!project) {
      return ResponseHandler.notFound(res, "Project Not found");
    }

    ResponseHandler.success(res, toProjectDTO(project));
  });

  updateProject = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) throw new ValidationError("Unauthorized");
    const { id } = req.params;

    const validation = ProjectUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return ResponseHandler.validationError(res, validation.error.format());
    }

    this._logger.info(`Updating project ${id}`);
    const project = await this._updateProjectUC.execute(
      id,
      validation.data,
      authReq.user.id,
    );
    ResponseHandler.success(res, toProjectDTO(project), "Project updated");
  });

  deleteProject = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) return ResponseHandler.unauthorized(res, "Unauthorized");

    this._logger.info(`Deleting project ${id}`);
    await this._deleteProjectUC.execute(id, authReq.user.id);
    ResponseHandler.success(res, null, "Project deleted successfully");
  });

  getProjectVelocity = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;

    const parsed = z
      .object({ days: z.coerce.number().int().min(1).max(365).optional() })
      .safeParse(req.query);
    if (!parsed.success) {
      return ResponseHandler.validationError(res, parsed.error.format());
    }

    const days = parsed.data.days ?? 7;
    const result = await this._getProjectVelocityUC.execute(
      id,
      days,
      authReq.user!.id,
    );
    ResponseHandler.success(res, toVelocityDTO(result));
  });

  getProjectMembers = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    this._logger.info(`Fetching members for project ${id}`);

    const members = await this._getProjectMembersUC.execute(
      id,
      authReq.user!.id,
    );
    ResponseHandler.success(res, members.map(toUserDTO));
  });
}
