import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { INotificationRepo } from "../../infrastructure/interface/repositories/INotificationRepo";
import { IMarkAllNotificationsReadUseCase } from "../interface/useCases/IMarkAllNotificationsReadUseCase";

@injectable()
export class MarkAllNotificationsReadUseCase implements IMarkAllNotificationsReadUseCase {
  constructor(
    @inject(TYPES.INotificationRepo)
    private _notificationRepo: INotificationRepo,
  ) {}

  async execute(userId: string): Promise<void> {
    await this._notificationRepo.markAllAsRead(userId);
  }
}
