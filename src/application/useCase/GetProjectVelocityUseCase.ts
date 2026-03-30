import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ITaskRepo } from "../../application/interface/repositories/ITaskRepo";
import { IGetProjectVelocityUseCase } from "../interface/useCases/IGetProjectVelocityUseCase";
import { ILogger } from "../../application/interface/services/ILogger";
import { ISecurityService } from "../../application/interface/services/ISecurityService";

@injectable()
export class GetProjectVelocityUseCase implements IGetProjectVelocityUseCase {
  constructor(
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(
    projectId: string,
    days: number,
    requesterId: string,
  ): Promise<{ totalPoints: number; start: Date; end: Date; days: number }> {
    // Validate project access
    await this._securityService.validateProjectAccess(requesterId, projectId);

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    this._logger.info("Calculating project velocity", {
      projectId,
      days,
      requesterId,
    });
    const totalPoints = await this._taskRepo.sumDonePointsByProjectInRange(
      projectId,
      start,
      end,
    );

    return { totalPoints, start, end, days };
  }
}
