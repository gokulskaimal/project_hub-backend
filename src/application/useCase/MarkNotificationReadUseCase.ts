import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { INotificationRepo } from "../../infrastructure/interface/repositories/INotificationRepo";
import { IMarkNotificationReadUseCase } from "../interface/useCases/IMarkNotificationReadUseCase";

@injectable()
export class MarkNotificationReadUseCase implements IMarkNotificationReadUseCase {
  constructor(
    @inject(TYPES.INotificationRepo)
    private _notificationRepo: INotificationRepo,
  ) {}

  async execute(notificationId: string): Promise<void> {
    await this._notificationRepo.markAsRead(notificationId);
  }
}
