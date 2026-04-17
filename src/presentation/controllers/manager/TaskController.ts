import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../infrastructure/container/types";
import { ICreateTaskUseCase } from "../../../application/interface/useCases/ICreateTaskUseCase";
import {
  IGetTaskUseCase,
  IGetTaskByIdUseCase,
} from "../../../application/interface/useCases/IGetTaskUseCase";
import { IUpdateTaskUseCase } from "../../../application/interface/useCases/IUpdateTaskUseCase";
import { IDeleteTaskUseCase } from "../../../application/interface/useCases/IDeleteTaskUseCase";
import { AuthenticatedRequest } from "../../middleware/types/AuthenticatedRequest";
import { ResponseHandler } from "../../utils/ResponseHandler";
import { asyncHandler } from "../../../utils/asyncHandler";
import { StatusCodes } from "../../../infrastructure/config/statusCodes.enum";
import { ILogger } from "../../../application/interface/services/ILogger";
import { ISendMessageUseCase } from "../../../application/interface/useCases/ISendMessageUseCase";
import { IAddCommentUseCase } from "../../../application/interface/useCases/IAddCommentUseCase";
import { IAddAttachmentUseCase } from "../../../application/interface/useCases/IAddAttachmentUseCase";
import { toTaskDTO } from "../../../application/dto/TaskDTO";
import {
  TaskCreateSchema,
  TaskUpdateSchema,
  TaskCommentCreateSchema,
} from "../../../application/dto/ValidationSchemas";
import { Task } from "../../../domain/entities/Task";
import { IGetMemberTasksUseCase } from "../../../application/interface/useCases/IGetMemberTasksUseCase";
import { IGetOrgTasksUseCase } from "../../../application/interface/useCases/IGetOrgTasksUseCase";
import { IToggleTimerUseCase } from "../../../application/interface/useCases/IToggleTimerUseCase";
import { UserRole } from "../../../domain/enums/UserRole";

import { IGetTaskHistoryUseCase } from "../../../application/interface/useCases/IGetTaskHistoryUseCase";
import { toTaskHistoryDTO } from "../../../application/dto/TaskHistoryDTO";

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
    @inject(TYPES.ISendMessageUseCase)
    private _sendMessageUC: ISendMessageUseCase,
    @inject(TYPES.IAddCommentUseCase)
    private _addCommnetUseCase: IAddCommentUseCase,
    @inject(TYPES.IAddAttachmentUseCase)
    private _addAttachmentUseCase: IAddAttachmentUseCase,
  ) {}

  getTaskHistory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this._logger.info(`Fetching history for Task ${id}`);
    const history = await this._getTaskHistoryUC.execute(
      id,
      (req as AuthenticatedRequest).user!.id,
    );
    ResponseHandler.success(res, history.map(toTaskHistoryDTO));
  });

  createTask = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user || !authReq.user.orgId)
      return ResponseHandler.unauthorized(res, "Unauthorized");

    const validation = TaskCreateSchema.safeParse(req.body);
    if (!validation.success) {
      return ResponseHandler.validationError(res, validation.error.format());
    }

    const taskInput: Partial<Task> = {
      ...validation.data,
      orgId: authReq.user.orgId,
      dueDate: validation.data.dueDate
        ? new Date(validation.data.dueDate)
        : undefined,
    };

    this._logger.info(
      `Creating task '${taskInput.title}' in Project ${taskInput.projectId}`,
    );
    const task = await this._createTaskUC.execute(taskInput, authReq.user.id);
    ResponseHandler.success(
      res,
      toTaskDTO(task),
      "Task created",
      StatusCodes.CREATED,
    );
  });

  getTaskById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this._logger.info(`Fetching Task ${id}`);
    const task = await this._getTaskByIdUC.execute(
      id,
      (req as AuthenticatedRequest).user!.id,
    );
    if (!task) {
      return ResponseHandler.notFound(res, "Task not found");
    }
    ResponseHandler.success(res, toTaskDTO(task));
  });

  getProjectTask = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const authReq = req as AuthenticatedRequest;

    this._logger.info(`Fetching tasks for Project ${projectId}`);

    const tasks = await this._getTaskUC.execute(projectId, authReq.user!.id);
    ResponseHandler.success(res, tasks.map(toTaskDTO));
  });

  getAllTasks = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { epicId, parentTaskId } = req.query;
    const authReq = req as AuthenticatedRequest;
    this._logger.info(`Fetching tasks for Project ${projectId}`);
    const tasks = await this._getTaskUC.execute(projectId, authReq.user!.id, {
      epicId: epicId as string,
      parentTaskId: parentTaskId as string,
    });
    ResponseHandler.success(res, tasks.map(toTaskDTO));
  });

  getMemberTasks = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;
    const orgId = authReq.user?.orgId;
    const role = authReq.user?.role;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;

    let result;

    if (role === UserRole.ORG_MANAGER || role === UserRole.SUPER_ADMIN) {
      result = await this._getOrgTasksUC.executePaginated(
        orgId!,
        limit,
        offset,
      );
    } else {
      result = await this._getMemberTasksUC.executePaginated(
        userId!,
        limit,
        offset,
      );
    }

    const { tasks, total } = result;

    ResponseHandler.success(res, {
      items: tasks.map(toTaskDTO),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  });

  getOrgTask = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const orgId = authReq.user?.orgId;
    if (!orgId) {
      return ResponseHandler.forbidden(
        res,
        "You are not authorized to perform this action",
      );
    }
    const tasks = await this._getOrgTasksUC.execute(orgId, authReq.user!.id);
    ResponseHandler.success(res, tasks.map(toTaskDTO));
  });

  updateTask = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return ResponseHandler.unauthorized(res, "Unauthorized");
    }

    const validation = TaskUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return ResponseHandler.validationError(res, validation.error.format());
    }

    this._logger.info(`Updating task ${id} by user ${authReq.user.id}`);
    const task = await this._updateTaskUC.execute(
      id,
      {
        ...validation.data,
        dueDate: validation.data.dueDate
          ? new Date(validation.data.dueDate)
          : undefined,
      },
      authReq.user!.id,
    );
    ResponseHandler.success(res, toTaskDTO(task), "Task updated");
  });

  deleteTask = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return ResponseHandler.unauthorized(res, "Unauthorized");
    }
    this._logger.info(`Deleting task ${id}`);
    await this._deleteTaskUC.execute(id, authReq.user.id);
    ResponseHandler.success(res, null, "Task deleted");
  });

  toggleTimer = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { action } = req.body;
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return ResponseHandler.unauthorized(res, "Unauthorized");
    }

    if (action !== "start" && action !== "stop") {
      return ResponseHandler.validationError(
        res,
        "Invalid action. Must be 'start' or 'stop'",
      );
    }

    this._logger.info(`Toggling timer for task ${id}: ${action}`);
    const task = await this._toggleTimerUC.execute(id, authReq.user.id, action);

    if (!task) {
      return ResponseHandler.notFound(res, "Task not found");
    }

    ResponseHandler.success(res, toTaskDTO(task));
  });

  getTaskComments = asyncHandler(async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return ResponseHandler.unauthorized(res, "Unauthorized");
    }
    this._logger.info(`Fetching comments for task ${taskId}`);
    const task = await this._getTaskByIdUC.execute(taskId, authReq.user.id);
    if (!task) {
      return ResponseHandler.notFound(res, "Task not found");
    }
    ResponseHandler.success(res, task.comments);
  });

  addComment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return ResponseHandler.unauthorized(res, "Unauthorized");
    }

    const validation = TaskCommentCreateSchema.safeParse(req.body);
    if (!validation.success) {
      return ResponseHandler.validationError(res, validation.error.format());
    }

    this._logger.info(
      `Adding comment to task ${id} by user ${authReq.user.id}`,
    );
    const updatedTask = await this._addCommnetUseCase.execute(
      id,
      authReq.user!.id,
      validation.data.text,
    );

    ResponseHandler.success(res, toTaskDTO(updatedTask), "Comment added");
  });

  addAttachment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) return ResponseHandler.unauthorized(res, "Unauthorized");

    this._logger.info(`Adding attachment to task ${id}`);

    const updated = await this._addAttachmentUseCase.execute(
      id,
      authReq.user!.id,
      req.body,
    );

    ResponseHandler.success(res, toTaskDTO(updated), "Attachment added");
  });
}
