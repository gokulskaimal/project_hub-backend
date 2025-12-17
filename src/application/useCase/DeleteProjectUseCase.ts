import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IProjectRepo } from "../../infrastructure/interface/repositories/IProjectRepo";
import { IDeleteProjectUseCase } from "../interface/useCases/IDeleteProjectUseCase";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";

import { ILogger } from "../../infrastructure/interface/services/ILogger";

@injectable()
export class DeleteProjectUseCase implements IDeleteProjectUseCase {
    constructor(
        @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
        @inject(TYPES.ILogger) private _logger: ILogger
    ) { }

    async execute(id: string): Promise<boolean> {
        this._logger.info(`Deleting project ${id}`);
        const success = await this._projectRepo.delete(id);
        if (!success) throw new EntityNotFoundError("Project", id);
        return true;
    }
}