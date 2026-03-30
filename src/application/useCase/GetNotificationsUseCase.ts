import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { INotificationRepo } from "../../application/interface/repositories/INotificationRepo";
import { IGetNotificationsUseCase } from "../interface/useCases/IGetNotificationsUseCase";
import { Notification } from "../../domain/entities/Notification";

@injectable()
export class GetNotificationsUseCase implements IGetNotificationsUseCase {
  constructor(
    @inject(TYPES.INotificationRepo)
    private _notificationRepo: INotificationRepo,
  ) {}

  async execute(userId: string): Promise<Notification[]> {
    return this._notificationRepo.findByUser(userId);
  }
}
