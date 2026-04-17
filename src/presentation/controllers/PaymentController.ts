import { Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ICreateSubscriptionUseCase } from "../../application/interface/useCases/ICreateSubscriptionUseCase";
import { IVerifyPaymentUseCase } from "../../application/interface/useCases/IVerifyPaymentUseCase";
import { ResponseHandler } from "../utils/ResponseHandler";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthenticatedRequest } from "../middleware/types/AuthenticatedRequest";

@injectable()
export class PaymentController {
  constructor(
    @inject(TYPES.ICreateSubscriptionUseCase)
    private _createSubscriptionUC: ICreateSubscriptionUseCase,
    @inject(TYPES.IVerifyPaymentUseCase)
    private _verifyPaymentUC: IVerifyPaymentUseCase,
  ) {}

  createSubscription = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { planId } = req.body;
      const userId = req.user!.id;

      if (!planId) {
        ResponseHandler.validationError(res, "Plan ID is required");
        return;
      }

      const subscription = await this._createSubscriptionUC.execute(
        userId,
        planId,
      );
      ResponseHandler.created(res, subscription, "Subscription created");
    },
  );

  verifyPayment = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        razorpay_subscription_id,
      } = req.body;
      const orgId = req.user!.orgId!;

      const orderId = razorpay_order_id || razorpay_subscription_id;

      if (!orderId || !razorpay_payment_id || !razorpay_signature) {
        ResponseHandler.validationError(res, "Missing payment details");
        return;
      }

      const isValid = await this._verifyPaymentUC.execute(
        orderId,
        razorpay_payment_id,
        razorpay_signature,
        orgId,
      );

      if (isValid) {
        ResponseHandler.success(
          res,
          null,
          "Payment verified and subscription updated",
        );
      } else {
        ResponseHandler.validationError(res, "Payment signature not found");
        return;
      }
    },
  );
}
