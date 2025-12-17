import { injectable , inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ITaskRepo } from "../../infrastructure/interface/repositories/ITaskRepo";
import { IDeleteTaskUseCase } from "../interface/useCases/IDeleteTaskUseCase";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";


import { ILogger } from "../../infrastructure/interface/services/ILogger";

@injectable()

export class DeleteTaskUseCase implements IDeleteTaskUseCase {
    constructor(
        @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
        @inject(TYPES.ILogger) private _logger: ILogger
    ) { }

    async execute(id: string): Promise<boolean> {
        this._logger.info(`Deleting task ${id}`);
        const success = await this._taskRepo.delete(id);
        if(!success) throw new EntityNotFoundError('Task Not Found' , id)
        return true
    }
}