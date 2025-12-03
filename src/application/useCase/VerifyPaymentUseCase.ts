import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IRazorpayService } from "../../infrastructure/interface/services/IRazorpayService";
import { IVerifyPaymentUseCase } from "../interface/useCases/IVerifyPaymentUseCase";

@injectable()
export class VerifyPaymentUseCase implements IVerifyPaymentUseCase {
  constructor(
    @inject(TYPES.IRazorpayService) private _razorpayService: IRazorpayService,
  ) {}

  async execute(
    orderId: string,
    paymentId: string,
    signature: string,
  ): Promise<boolean> {
    return this._razorpayService.verifySignature(orderId, paymentId, signature);
  }
}
