import { injectable , inject } from "inversify";
import {TYPES} from "../../infrastructure/container/types";
import {IGetTaskUseCase} from "../interface/useCases/IGetTaskUseCase";
import {ITaskRepo} from "../../infrastructure/interface/repositories/ITaskRepo";
import {Task} from "../../domain/entities/Task";
import {EntityNotFoundError} from "../../domain/errors/CommonErrors";

export class GetTaskUseCase implements IGetTaskUseCase{
    constructor(
        @inject(TYPES.ITaskRepo) private _taskRepo : ITaskRepo
    ){}

    async execute(projectId: string): Promise<Task[]> {
        const task = await this._taskRepo.findByProject(projectId)
        if(!task) throw new EntityNotFoundError('Task Not Found' , projectId)
        return task
    }
}