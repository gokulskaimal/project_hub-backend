import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../infrastructure/container/types";
import { ICreateTaskUseCase } from "../../../application/interface/useCases/ICreateTaskUseCase";
import { IGetTaskUseCase } from "../../../application/interface/useCases/IGetTaskUseCase";
import { IGetTaskByIdUseCase } from "../../../application/interface/useCases/IGetTaskUseCase";
import { IUpdateTaskUseCase } from "../../../application/interface/useCases/IUpdateTaskUseCase";
import { IDeleteTaskUseCase } from "../../../application/interface/useCases/IDeleteTaskUseCase";
import { AuthenticatedRequest } from "../../middleware/types/AuthenticatedRequest";
import { asyncHandler } from "../../middleware/ErrorMiddleware";
import { StatusCodes } from "../../../infrastructure/config/statusCodes.enum";
import {
  ValidationError,
  EntityNotFoundError,
} from "../../../domain/errors/CommonErrors";
import { ILogger } from "../../../infrastructure/interface/services/ILogger";
import { toTaskDTO } from "../../../application/dto/TaskDTO";
import {
  TaskCreateSchema,
  TaskUpdateSchema,
} from "../../../application/dto/ValidationSchemas";
import { Task, TaskComment } from "../../../domain/entities/Task";

import { IGetMemberTasksUseCase } from "../../../application/interface/useCases/IGetMemberTasksUseCase";
import { IGetOrgTasksUseCase } from "../../../application/interface/useCases/IGetOrgTasksUseCase";
import { IToggleTimerUseCase } from "../../../application/interface/useCases/IToggleTimerUseCase";
import { UserRole } from "../../../domain/enums/UserRole";

import { IGetTaskHistoryUseCase } from "../../../application/interface/useCases/IGetTaskHistoryUseCase";

@injectable()
export class TaskController {
  constructor(
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.ICreateTaskUseCase) private _createTaskUC: ICreateTaskUseCase,
    @inject(TYPES.IGetTaskUseCase) private _getTaskUC: IGetTaskUseCase,
    @inject(TYPES.IGetTaskByIdUseCase)
    private _getTaskByIdUC: IGetTaskByIdUseCase,
    @inject(TYPES.IUpdateTaskUseCase) private _updateTaskUC: IUpdateTaskUseCase,
    @inject(TYPES.IDeleteTaskUseCase) private _deleteTaskUC: IDeleteTaskUseCase,
    @inject(TYPES.IGetMemberTasksUseCase)
    private _getMemberTasksUC: IGetMemberTasksUseCase,
    @inject(TYPES.IGetOrgTasksUseCase)
    private _getOrgTasksUC: IGetOrgTasksUseCase,
    @inject(TYPES.IToggleTimerUseCase)
    private _toggleTimerUC: IToggleTimerUseCase,
    @inject(TYPES.IGetTaskHistoryUseCase)
    private _getTaskHistoryUC: IGetTaskHistoryUseCase,
  ) {}

  getTaskHistory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this._logger.info(`Fetching history for Task ${id}`);
    const history = await this._getTaskHistoryUC.execute(id);
    res.status(StatusCodes.OK).json({ success: true, data: history });
  });

  createTask = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user || !authReq.user.orgId)
      throw new ValidationError("Unauthorized: Missing user context");

    // 1. Zod Parsing & Validation
    const validation = TaskCreateSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Validation Error",
        errors: validation.error.format(),
      });
      return;
    }

    const validatedData = validation.data;
    const { projectId, title } = validatedData;

    // build typed input with converted dueDate
    const taskInput: Partial<Task> = {
      orgId: authReq.user.orgId,
      projectId: validatedData.projectId,
      title: validatedData.title,
      priority: validatedData.priority,
      type: validatedData.type,
      description: validatedData.description,
      storyPoints: validatedData.storyPoints,
      assignedTo: validatedData.assignedTo,
      parentTaskId: validatedData.parentTaskId,
      ...(validatedData.dueDate
        ? { dueDate: new Date(validatedData.dueDate) }
        : {}),
    };

    this._logger.info(`Creating task '${title}' in Project ${projectId}`);
    const task = await this._createTaskUC.execute(taskInput, authReq.user.id);
    res
      .status(StatusCodes.CREATED)
      .json({ success: true, data: toTaskDTO(task) });
  });

  getAllTasks = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    this._logger.info(`Fetching tasks for Project ${projectId}`);
    const tasks = await this._getTaskUC.execute(projectId);
    res
      .status(StatusCodes.OK)
      .json({ success: true, data: tasks.map(toTaskDTO) });
  });

  getMemberTasks = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;
    if (!userId)
      throw new ValidationError("Unauthorized: Missing user context");

    const userRole = authReq.user?.role;
    let tasks: Task[] = [];

    if (
      userRole === UserRole.ORG_MANAGER ||
      userRole === UserRole.SUPER_ADMIN
    ) {
      const orgId = authReq.user?.orgId;
      if (!orgId)
        throw new ValidationError("Unauthorized: Missing org context");
      this._logger.info(`Fetching tasks for org ${orgId}`);
      tasks = await this._getOrgTasksUC.execute(orgId);
    } else {
      this._logger.info(`Fetching tasks for member ${userId}`);
      tasks = await this._getMemberTasksUC.execute(userId);
    }

    res
      .status(StatusCodes.OK)
      .json({ success: true, data: tasks.map(toTaskDTO) });
  });

  updateTask = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) throw new ValidationError("Unauthorized");

    // Zod parsing & Validation
    const validation = TaskUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Validation Error",
        errors: validation.error.format(),
      });
      return;
    }

    const { dueDate, parentTaskId, ...rest } = validation.data;
    const taskInput: Partial<Task> = {
      ...rest,
      ...(parentTaskId ? { parentTaskId } : {}),
      ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
    };

    this._logger.info(`Updating task ${id} by user ${authReq.user.id}`);
    const task = await this._updateTaskUC.execute(
      id,
      taskInput,
      authReq.user.id,
    );
    res.status(StatusCodes.OK).json({ success: true, data: toTaskDTO(task) });
  });

  deleteTask = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this._logger.info(`Deleting task ${id}`);
    await this._deleteTaskUC.execute(id);
    res.status(StatusCodes.OK).json({ success: true, message: "Task deleted" });
  });

  toggleTimer = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { action } = req.body;
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user)
      throw new ValidationError("Unauthorized: Missing user context");

    if (action !== "start" && action !== "stop") {
      throw new ValidationError("Invalid action. Must be 'start' or 'stop'");
    }

    this._logger.info(`Toggling timer for task ${id}: ${action}`);
    const task = await this._toggleTimerUC.execute(id, authReq.user.id, action);

    if (!task) {
      throw new EntityNotFoundError("Task", id);
    }

    res.status(StatusCodes.OK).json({ success: true, data: toTaskDTO(task) });
  });

  addComment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { text } = req.body;
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) throw new ValidationError("Unauthorized");

    this._logger.info(
      `Adding comment to task ${id} by user ${authReq.user.id}`,
    );

    // use dedicated query use case for lookup
    const task = await this._getTaskByIdUC.execute(id);
    if (!task) throw new EntityNotFoundError("Task not found");

    const updatedComments: TaskComment[] = task.comments || [];
    updatedComments.push({
      userId: authReq.user.id,
      text,
      createdAt: new Date(),
    });

    const updated = await this._updateTaskUC.execute(
      id,
      { comments: updatedComments },
      authReq.user.id,
    );
    res
      .status(StatusCodes.OK)
      .json({ success: true, data: toTaskDTO(updated) });
  });

  addAttachment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { url } = req.body; // URL from cloudinary upload
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) throw new ValidationError("Unauthorized");

    this._logger.info(`Adding attachment to task ${id}`);

    const task = await this._getTaskByIdUC.execute(id);
    if (!task) throw new EntityNotFoundError("Task not found");
    const updatedAttachments = task.attachments || [];
    updatedAttachments.push(url);

    const updated = await this._updateTaskUC.execute(
      id,
      { attachments: updatedAttachments },
      authReq.user.id,
    );
    res
      .status(StatusCodes.OK)
      .json({ success: true, data: toTaskDTO(updated) });
  });
}
