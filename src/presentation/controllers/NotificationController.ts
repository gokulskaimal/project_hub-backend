import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/types/AuthenticatedRequest";
import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IGetNotificationsUseCase } from "../../application/interface/useCases/IGetNotificationsUseCase";
import { IMarkNotificationReadUseCase } from "../../application/interface/useCases/IMarkNotificationReadUseCase";
import { IMarkAllNotificationsReadUseCase } from "../../application/interface/useCases/IMarkAllNotificationsReadUseCase";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";

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

  async getNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      const notifications = await this._getNotificationsUC.execute(userId);
      res.status(StatusCodes.OK).json(notifications);
    } catch (error) {
      next(error);
    }
  }

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await this._markReadUC.execute(id);
      res
        .status(StatusCodes.OK)
        .json({ success: true, message: "Notification marked as read" });
    } catch (error) {
      next(error);
    }
  }

  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      await this._markAllReadUC.execute(userId);
      res
        .status(StatusCodes.OK)
        .json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
      next(error);
    }
  }
}
