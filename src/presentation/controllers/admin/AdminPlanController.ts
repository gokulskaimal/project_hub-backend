import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../infrastructure/container/types";
import { ICreatePlanUseCase } from "../../../application/interface/useCases/ICreatePlanUseCase";
import { IGetPlanUseCase } from "../../../application/interface/useCases/IGetPlanUseCase";
import { IUpdatePlanUseCase } from "../../../application/interface/useCases/IUpdatePlanUseCase";
import { IDeletePlanUseCase } from "../../../application/interface/useCases/IDeletePlanUseCase";
import { ILogger } from "../../../application/interface/services/ILogger";
import { StatusCodes } from "../../../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../../../infrastructure/config/common.constants";
import { asyncHandler } from "../../middleware/ErrorMiddleware";
import {
  EntityNotFoundError,
  ValidationError,
} from "../../../domain/errors/CommonErrors";
import { toPlanDTO } from "../../../application/dto/PlanDTO";
import { AuthenticatedRequest } from "../../middleware/types/AuthenticatedRequest";

@injectable()
export class AdminPlanController {
  constructor(
    @inject(TYPES.ICreatePlanUseCase)
    private _createPlanUseCase: ICreatePlanUseCase,
    @inject(TYPES.IGetPlanUseCase) private _getPlanUseCase: IGetPlanUseCase,
    @inject(TYPES.IUpdatePlanUseCase)
    private _updatePlanUseCase: IUpdatePlanUseCase,
    @inject(TYPES.IDeletePlanUseCase)
    private _deletePlanUseCase: IDeletePlanUseCase,
    @inject(TYPES.ILogger) private logger: ILogger,
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

  createPlan = asyncHandler(async (req: Request, res: Response) => {
    const planData = req.body;
    this.logger.info("Creating Subscription Plan", { body: planData });
    if (!planData) {
      throw new ValidationError("Request body is missing");
    }
    if (
      !planData.name ||
      planData.price === undefined ||
      planData.price === null ||
      !planData.currency ||
      !planData.type
    ) {
      throw new ValidationError(COMMON_MESSAGES.INVALID_INPUT);
    }

    const authReq = req as AuthenticatedRequest;
    const newPlan = await this._createPlanUseCase.execute(
      planData,
      authReq.user!.id,
    );
    this.sendSuccess(
      res,
      toPlanDTO(newPlan),
      COMMON_MESSAGES.CREATED,
      StatusCodes.CREATED,
    );
  });

  getPlans = asyncHandler(async (req: Request, res: Response) => {
    this.logger.info("Fetching Subscritption Plans");
    const plans = await this._getPlanUseCase.execute({ isActive: true });
    this.sendSuccess(res, plans.map(toPlanDTO));
  });

  updatePlan = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const planData = req.body;
    this.logger.info("Updating Subscription Plan", { planId: id });
    if (!id) throw new ValidationError("Plan ID is required");

    const authReq = req as AuthenticatedRequest;
    const updatedPlan = await this._updatePlanUseCase.execute(
      id,
      planData,
      authReq.user!.id,
    );
    if (!updatedPlan) throw new EntityNotFoundError("Plan", id);

    this.sendSuccess(res, toPlanDTO(updatedPlan), COMMON_MESSAGES.UPDATED);
  });

  deletePlan = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.info("Deleting Subscription Plan", { planId: id });
    if (!id) throw new ValidationError("Plan ID is required");

    const authReq = req as AuthenticatedRequest;
    const success = await this._deletePlanUseCase.execute(id, authReq.user!.id);
    if (!success) throw new EntityNotFoundError("Plan", id);

    this.sendSuccess(res, null, COMMON_MESSAGES.DELETED);
  });
}
