import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ITaskRepo } from "../../infrastructure/interface/repositories/ITaskRepo";
import { IGetUserVelocityUseCase } from "../interface/useCases/IGetUserVelocityUseCase";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { ISecurityService } from "../../infrastructure/interface/services/ISecurityService";

@injectable()
export class GetUserVelocityUseCase implements IGetUserVelocityUseCase {
  constructor(
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(
    userId: string,
    days: number,
    requesterId: string,
  ): Promise<{ totalPoints: number; start: Date; end: Date; days: number }> {
    // Validate user ownership
    await this._securityService.validateUserOwnership(requesterId, userId);

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    this._logger.info("Calculating user velocity", {
      userId,
      days,
      requesterId,
    });
    const totalPoints = await this._taskRepo.sumDonePointsByUserInRange(
      userId,
      start,
      end,
    );

    return { totalPoints, start, end, days };
  }
}
