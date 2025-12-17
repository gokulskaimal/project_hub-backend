import { injectable,inject } from "inversify";
import {TYPES} from "../../infrastructure/container/types";
import { ITaskRepo } from "../../infrastructure/interface/repositories/ITaskRepo";
import { IUpdateTaskUseCase } from "../interface/useCases/IUpdateTaskUseCase";
import { Task } from "../../domain/entities/Task";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";

import { ILogger } from "../../infrastructure/interface/services/ILogger";


@injectable()
export class UpdateTaskUseCase implements IUpdateTaskUseCase{
    constructor(
        @inject(TYPES.ITaskRepo) private _taskRepo : ITaskRepo,
        @inject(TYPES.ILogger) private _logger: ILogger
    ){}

    async execute(id: string, data: Partial<Task>): Promise<Task> {
        this._logger.info(`Executing UpdateTaskUseCase for task ID: ${id}`);
        const task = await this._taskRepo.findById(id);
        if(!task) throw new EntityNotFoundError('Task Not Found', id);
        
        const updated = await this._taskRepo.update(id, data);
        if(!updated) throw new EntityNotFoundError('Task Not Found', id); // Double check just in case, or cast
        return updated;
    }
}