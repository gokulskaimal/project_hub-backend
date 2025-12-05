import { injectable, inject } from "inversify";
import { IGetSubscriptionUseCase } from "../interface/useCases/IGetSubscriptionUseCase";
import { ISubscriptionRepo } from "../../infrastructure/interface/repositories/ISubscriptionRepo";
import { TYPES } from "../../infrastructure/container/types";
import { Subscription } from "../../domain/entities/Subscription";

@injectable()
export class GetSubscriptionUseCase implements IGetSubscriptionUseCase {
  constructor(
    @inject(TYPES.ISubscriptionRepo)
    private _subscriptionRepo: ISubscriptionRepo,
  ) {}

  async execute(userId: string): Promise<Subscription | null> {
    return this._subscriptionRepo.findByUserId(userId);
  }
}
