import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../infrastructure/container/types";
import { ICreateTaskUseCase } from "../../../application/interface/useCases/ICreateTaskUseCase";
import { IGetTaskUseCase } from "../../../application/interface/useCases/IGetTaskUseCase";
import { IUpdateTaskUseCase } from "../../../application/interface/useCases/IUpdateTaskUseCase";
import { IDeleteTaskUseCase } from "../../../application/interface/useCases/IDeleteTaskUseCase";
import { AuthenticatedRequest } from "../../middleware/types/AuthenticatedRequest";
import { asyncHandler } from "../../middleware/ErrorMiddleware";
import { StatusCodes } from "../../../infrastructure/config/statusCodes.enum";
import { ValidationError } from "../../../domain/errors/CommonErrors";
import { ILogger } from "../../../infrastructure/interface/services/ILogger";
import { toTaskDTO } from "../../../application/dto/TaskDTO";



@injectable()
export class TaskController {
    constructor(
        @inject(TYPES.ILogger) private _logger: ILogger,
        @inject(TYPES.ICreateTaskUseCase) private _createTaskUC: ICreateTaskUseCase,
        @inject(TYPES.IGetTaskUseCase) private _getTaskUC: IGetTaskUseCase,
        @inject(TYPES.IUpdateTaskUseCase) private _updateTaskUC: IUpdateTaskUseCase,
        @inject(TYPES.IDeleteTaskUseCase) private _deleteTaskUC: IDeleteTaskUseCase,
    ) { }

    createTask = asyncHandler(async (req: Request, res: Response) => {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user || !authReq.user.orgId) throw new ValidationError("Unauthorized: Missing user context");
        const { projectId, title, description, priority, dueDate, assignedTo } = req.body;
        if (!projectId || !title) throw new ValidationError("Project ID and Title are required");

        this._logger.info(`Creating task '${title}' in Project ${projectId}`);
        const task = await this._createTaskUC.execute({
            orgId: authReq.user.orgId,
            projectId,
            title,
            description,
            priority,
            dueDate,
            assignedTo
        });
        res.status(StatusCodes.CREATED).json({ success: true, data: toTaskDTO(task) });
    })

    getAllTasks = asyncHandler(async (req: Request, res: Response) => {
        const { projectId } = req.params;
        this._logger.info(`Fetching tasks for Project ${projectId}`);
        const tasks = await this._getTaskUC.execute(projectId);
        res.status(StatusCodes.OK).json({ success: true, data: tasks.map(toTaskDTO) });
    })

    updateTask = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        this._logger.info(`Updating task ${id}`);
        const task = await this._updateTaskUC.execute(id, req.body);
        res.status(StatusCodes.OK).json({ success: true, data: toTaskDTO(task) });
    })

    deleteTask = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        this._logger.info(`Deleting task ${id}`);
        await this._deleteTaskUC.execute(id);
        res.status(StatusCodes.OK).json({ success: true, message: "Task deleted" });
    })
}