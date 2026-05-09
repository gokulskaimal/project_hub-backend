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
import { ResponseHandler } from "../../utils/ResponseHandler";
import { asyncHandler } from "../../../utils/asyncHandler";
import { toPlanDTO } from "../../../application/dto/PlanDTO";
import { AuthenticatedRequest } from "../../middleware/types/AuthenticatedRequest";
import {
  PlanCreateSchema,
  PlanUpdateSchema,
} from "../../../application/dto/ValidationSchemas";

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

  createPlan = asyncHandler(async (req: Request, res: Response) => {
    const planData = PlanCreateSchema.safeParse(req.body);
    this.logger.info("Creating Subscription Plan", { body: planData });
    if (!planData.success) {
      return ResponseHandler.validationError(res, "Request body is missing");
    }
    if (
      !planData.data.name ||
      !planData.data.price ||
      !planData.data.currency ||
      !planData.data.type
    ) {
      return ResponseHandler.validationError(
        res,
        COMMON_MESSAGES.INVALID_INPUT,
      );
    }

    const authReq = req as AuthenticatedRequest;
    const newPlan = await this._createPlanUseCase.execute(
      planData.data,
      authReq.user!.id,
    );
    ResponseHandler.success(
      res,
      toPlanDTO(newPlan),
      COMMON_MESSAGES.CREATED,
      StatusCodes.CREATED,
    );
  });

  getPlans = asyncHandler(async (req: Request, res: Response) => {
    this.logger.info("Fetching Subscritption Plans");
    const plans = await this._getPlanUseCase.execute({ isActive: true });
    ResponseHandler.success(res, plans.map(toPlanDTO));
  });

  updatePlan = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.info("Updating Subscription Plan", { planId: id });
    if (!id) {
      return ResponseHandler.validationError(res, "Plan ID is required");
    }

    const validation = PlanUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return ResponseHandler.validationError(res, validation.error.format());
    }

    const authReq = req as AuthenticatedRequest;
    const updatedPlan = await this._updatePlanUseCase.execute(
      id,
      validation.data,
      authReq.user!.id,
    );
    if (!updatedPlan) {
      return ResponseHandler.notFound(res, "Plan not found");
    }

    ResponseHandler.success(
      res,
      toPlanDTO(updatedPlan),
      COMMON_MESSAGES.UPDATED,
    );
  });

  deletePlan = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.info("Deleting Subscription Plan", { planId: id });
    if (!id) {
      return ResponseHandler.validationError(res, "Plan ID is required");
    }

    const authReq = req as AuthenticatedRequest;
    const success = await this._deletePlanUseCase.execute(id, authReq.user!.id);
    if (!success) {
      return ResponseHandler.notFound(res, "Plan not found");
    }

    ResponseHandler.success(res, null, COMMON_MESSAGES.DELETED);
  });
}
