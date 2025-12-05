import { Subscription } from "../../../domain/entities/Subscription";

export interface IGetSubscriptionUseCase {
  execute(userId: string): Promise<Subscription | null>;
}
