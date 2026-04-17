import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/types/AuthenticatedRequest";
import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IGetNotificationsUseCase } from "../../application/interface/useCases/IGetNotificationsUseCase";
import { IMarkNotificationReadUseCase } from "../../application/interface/useCases/IMarkNotificationReadUseCase";
import { IMarkAllNotificationsReadUseCase } from "../../application/interface/useCases/IMarkAllNotificationsReadUseCase";
import { toNotificationDTO } from "../../application/dto/NotificationDTO";
import { ResponseHandler } from "../utils/ResponseHandler";
import { asyncHandler } from "../../utils/asyncHandler";

@injectable()
export class NotificationController {
  constructor(
    @inject(TYPES.IGetNotificationsUseCase)
    private _getNotificationsUC: IGetNotificationsUseCase,
    @inject(TYPES.IMarkNotificationReadUseCase)
    private _markReadUC: IMarkNotificationReadUseCase,
    @inject(TYPES.IMarkAllNotificationsReadUseCase)
    private _markAllReadUC: IMarkAllNotificationsReadUseCase,
  ) {}

  getNotification = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user!.id;
      const notifications = await this._getNotificationsUC.execute(userId);
      ResponseHandler.success(
        res,
        notifications.map(toNotificationDTO),
        "Notifications fetched successfully",
      );
    },
  );

  markRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    await this._markReadUC.execute(id, userId);
    ResponseHandler.success(res, null, "Notification marked as read");
  });

  markAllRead = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user!.id;
      await this._markAllReadUC.execute(userId);
      ResponseHandler.success(res, null, "All notifications marked as read");
    },
  );
}
