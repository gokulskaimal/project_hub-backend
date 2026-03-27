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
import { asyncHandler } from "../../middleware/ErrorMiddleware";
import { StatusCodes } from "../../../infrastructure/config/statusCodes.enum";
import {
  ValidationError,
  EntityNotFoundError,
} from "../../../domain/errors/CommonErrors";
import { ILogger } from "../../../infrastructure/interface/services/ILogger";
import { ISendMessageUseCase } from "../../../application/interface/useCases/ISendMessageUseCase";
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

  getTaskHistory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this._logger.info(`Fetching history for Task ${id}`);
    const history = await this._getTaskHistoryUC.execute(
      id,
      (req as AuthenticatedRequest).user!.id,
    );
    this.sendSuccess(res, history.map(toTaskHistoryDTO));
  });

  createTask = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user || !authReq.user.orgId)
      throw new ValidationError("Unauthorized: Missing user context");

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

    const taskInput: Partial<Task> = {
      orgId: authReq.user.orgId,
      projectId: validatedData.projectId,
      title: validatedData.title,
      priority: validatedData.priority,
      type: validatedData.type,
      description: validatedData.description ?? undefined,
      storyPoints: validatedData.storyPoints ?? undefined,
      assignedTo: validatedData.assignedTo ?? undefined,
      sprintId: (req.body as { sprintId?: string }).sprintId,
      parentTaskId: validatedData.parentTaskId ?? undefined,
      ...(validatedData.dueDate
        ? { dueDate: new Date(validatedData.dueDate) }
        : {}),
    };

    this._logger.info(`Creating task '${title}' in Project ${projectId}`);
    const task = await this._createTaskUC.execute(taskInput, authReq.user.id);
    this.sendSuccess(res, toTaskDTO(task), "Task created", StatusCodes.CREATED);
  });

  getTaskById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this._logger.info(`Fetching Task ${id}`);
    const task = await this._getTaskByIdUC.execute(
      id,
      (req as AuthenticatedRequest).user!.id,
    );
    if (!task) throw new EntityNotFoundError("Task", id);
    this.sendSuccess(res, toTaskDTO(task));
  });

  getAllTasks = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const authReq = req as AuthenticatedRequest;
    this._logger.info(`Fetching tasks for Project ${projectId}`);
    const tasks = await this._getTaskUC.execute(projectId, authReq.user!.id);
    this.sendSuccess(res, tasks.map(toTaskDTO));
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
      tasks = await this._getOrgTasksUC.execute(orgId, userId);
    } else {
      this._logger.info(`Fetching tasks for member ${userId}`);
      tasks = await this._getMemberTasksUC.execute(userId, userId);
    }

    this.sendSuccess(res, tasks.map(toTaskDTO));
  });

  updateTask = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) throw new ValidationError("Unauthorized");

    const validation = TaskUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Validation Error",
        errors: validation.error.format(),
      });
      return;
    }

    const { dueDate, parentTaskId, status, sprintId, ...rest } =
      validation.data;
    const taskInput: Partial<Task> = {
      ...rest,
      status: status as Task["status"],
      sprintId: sprintId ?? undefined,
      parentTaskId: parentTaskId ?? undefined,
      description: rest.description ?? undefined,
      storyPoints: rest.storyPoints ?? undefined,
      assignedTo: rest.assignedTo ?? undefined,
      ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
    };

    this._logger.info(`Updating task ${id} by user ${authReq.user.id}`);
    const task = await this._updateTaskUC.execute(
      id,
      taskInput,
      authReq.user.id,
    );
    this.sendSuccess(res, toTaskDTO(task), "Task updated");
  });

  deleteTask = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) throw new ValidationError("Unauthorized");

    this._logger.info(`Deleting task ${id}`);
    await this._deleteTaskUC.execute(id, authReq.user.id);
    this.sendSuccess(res, null, "Task deleted");
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

    this.sendSuccess(res, toTaskDTO(task));
  });

  addComment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) throw new ValidationError("Unauthorized");

    const validation = TaskCommentCreateSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Validation Error",
        errors: validation.error.format(),
      });
      return;
    }

    const { text } = validation.data;
    this._logger.info(
      `Adding comment to task ${id} by user ${authReq.user.id}`,
    );

    const task = await this._getTaskByIdUC.execute(id, authReq.user.id);
    if (!task) throw new EntityNotFoundError("Task not found");

    const existingComments = (task.comments || []).map(
      (c: { userId: string; text: string; createdAt: Date }) => ({
        userId: c.userId,
        text: c.text,
        createdAt: c.createdAt,
      }),
    );

    const updatedComments = [
      ...existingComments,
      {
        userId: authReq.user.id,
        text,
        createdAt: new Date(),
      },
    ];

    const updated = await this._updateTaskUC.execute(
      id,
      { comments: updatedComments },
      authReq.user.id,
    );

    this.sendSuccess(res, toTaskDTO(updated), "Comment added");

    // Send an activity message to the project chat
    try {
      const userName = authReq.user.firstName
        ? `${authReq.user.firstName} ${authReq.user.lastName || ""}`.trim()
        : authReq.user.name || "A team member";

      await this._sendMessageUC.execute(
        authReq.user.id,
        task.projectId,
        `${userName} commented on task #${task.id.slice(-4)}: "${text.substring(0, 50)}${text.length > 50 ? "..." : ""}"`,
        "ACTIVITY",
      );
    } catch (chatErr) {
      this._logger.error(
        "Failed to post task comment to project chat",
        chatErr as Error,
      );
    }
  });

  addAttachment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { url, name, size, type } = req.body;
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) throw new ValidationError("Unauthorized");

    this._logger.info(`Adding attachment to task ${id}`);

    const task = await this._getTaskByIdUC.execute(id, authReq.user.id);
    if (!task) throw new EntityNotFoundError("Task not found");
    const updatedAttachments = task.attachments || [];
    updatedAttachments.push({ url, name: name || "Attachment", size, type });

    const updated = await this._updateTaskUC.execute(
      id,
      { attachments: updatedAttachments },
      authReq.user.id,
    );

    this.sendSuccess(res, toTaskDTO(updated), "Attachment added");

    // Send an activity message to the project chat
    try {
      const userName = authReq.user.firstName
        ? `${authReq.user.firstName} ${authReq.user.lastName || ""}`.trim()
        : authReq.user.name || "A team member";

      await this._sendMessageUC.execute(
        authReq.user.id,
        task.projectId,
        `${userName} attached "${name}" to task #${task.id.slice(-4)}`,
        "ACTIVITY",
      );
    } catch (chatErr) {
      this._logger.error(
        "Failed to post task attachment to project chat",
        chatErr as Error,
      );
    }
  });
}
