import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { TYPES } from "../../../infrastructure/container/types";
import { ResponseHandler } from "../../utils/ResponseHandler";
import { asyncHandler } from "../../../utils/asyncHandler";
import { AuthenticatedRequest } from "../../middleware/types/AuthenticatedRequest";
import { ICreateMeetingUseCase } from "../../../application/interface/useCases/ICreateMeetingUseCase";
import { IGetSprintMeetingUseCase } from "../../../application/interface/useCases/IGetSprintMeetingUseCase";
import { IUpdateMeetingUseCase } from "../../../application/interface/useCases/IUpdateMeetingUseCase";
import { IGetMyMeetingsUseCase } from "../../../application/interface/useCases/IGetMyMeetingsUseCase";
import { ICompleteMeetingUseCase } from "../../../application/interface/useCases/ICompleteMeetingUseCase";
import { IDeleteMeetingUseCase } from "../../../application/interface/useCases/IDeleteMeetingUseCase";

@injectable()
export class MeetingController {
  constructor(
    @inject(TYPES.ICreateMeetingUseCase)
    private createMeetingUseCase: ICreateMeetingUseCase,
    @inject(TYPES.IGetSprintMeetingsUseCase)
    private getSprintMeetingsUseCase: IGetSprintMeetingUseCase,
    @inject(TYPES.IUpdateMeetingUseCase)
    private updateMeetingUseCase: IUpdateMeetingUseCase,
    @inject(TYPES.IGetMyMeetingsUseCase)
    private getMyMeetingsUseCase: IGetMyMeetingsUseCase,
    @inject(TYPES.ICompleteMeetingUseCase)
    private completeMeetingUseCase: ICompleteMeetingUseCase,
    @inject(TYPES.IDeleteMeetingUseCase)
    private deleteMeetingUseCase: IDeleteMeetingUseCase,
  ) {}

  createMeeting = asyncHandler(async (req: Request, res: Response) => {
    const creatorId = (req as AuthenticatedRequest).user!.id;
    const meeting = await this.createMeetingUseCase.execute(
      req.body,
      creatorId,
    );
    return ResponseHandler.success(
      res,
      meeting,
      "Meeting scheduled successfully",
    );
  });

  getSprintMeetings = asyncHandler(async (req: Request, res: Response) => {
    const meetings = await this.getSprintMeetingsUseCase.execute(
      req.params.sprintId,
    );
    return ResponseHandler.success(
      res,
      meetings,
      "Meetings fetched successfully",
    );
  });

  updateMeeting = asyncHandler(async (req: Request, res: Response) => {
    const meeting = await this.updateMeetingUseCase.execute(
      req.params.roomId,
      req.body,
    );
    return ResponseHandler.success(
      res,
      meeting,
      "Meeting updated successfully",
    );
  });

  getMyMeetings = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const params = {
      userId: authReq.user!.id,
      role: authReq.user!.role,
      orgId: authReq.user!.orgId,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 12,
      status: req.query.status as "SCHEDULED" | "HISTORY" | undefined,
    };
    const result = await this.getMyMeetingsUseCase.execute(params);
    return ResponseHandler.success(
      res,
      result,
      "Meetings fetched successfully",
    );
  });

  completeMeeting = asyncHandler(async (req: Request, res: Response) => {
    const meeting = await this.completeMeetingUseCase.execute(
      req.params.roomId,
    );
    return ResponseHandler.success(
      res,
      meeting,
      "Meeting completed successfully",
    );
  });

  deleteMeeting = asyncHandler(async (req: Request, res: Response) => {
    await this.deleteMeetingUseCase.execute(req.params.roomId);
    return ResponseHandler.success(res, null, "Meeting deleted successfully");
  });
}
