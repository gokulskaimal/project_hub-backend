import { inject, injectable } from "inversify";
import { INotificationRepo } from "../../infrastructure/interface/repositories/INotificationRepo";
import { ISocketService } from "../../infrastructure/interface/services/ISocketService";
import { Notification } from "../../domain/entities/Notification";
import { TYPES } from "../../infrastructure/container/types";
import { ICreateNotificationUseCase } from "../interface/useCases/ICreateNotificationUseCase";

@injectable()
export class CreateNotificationUseCase implements ICreateNotificationUseCase {
  constructor(
    @inject(TYPES.INotificationRepo)
    private _notificationRepo: INotificationRepo,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
  ) {}

  async execute(
    userId: string,
    title: string,
    message: string,
    type: "INFO" | "SUCCESS" | "WARNING" | "ERROR",
    orgId: string,
    link?: string,
  ): Promise<void> {
    const notification = new Notification(
      "",
      userId,
      title,
      message,
      type,
      link || "",
      false,
      new Date(),
      orgId,
    );
    const saved = await this._notificationRepo.create(notification);
    this._socketService.emitToUser(userId, "notification:new", saved);
  }
}
