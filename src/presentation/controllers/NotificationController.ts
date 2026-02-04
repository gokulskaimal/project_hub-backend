import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/types/AuthenticatedRequest";
import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { INotificationRepo } from "../../infrastructure/interface/repositories/INotificationRepo";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";

@injectable()
export class NotificationController {
  constructor(
    @inject(TYPES.INotificationRepo)
    private _notificationRepo: INotificationRepo,
  ) {}

  async getNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthenticatedRequest).user!.id;
      const notifications = await this._notificationRepo.findByUser(userId);
      res.status(StatusCodes.OK).json(notifications);
    } catch (error) {
      next(error);
    }
  }

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await this._notificationRepo.markAsRead(id);
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
      await this._notificationRepo.markAllAsRead(userId);
      res
        .status(StatusCodes.OK)
        .json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
      next(error);
    }
  }
}
