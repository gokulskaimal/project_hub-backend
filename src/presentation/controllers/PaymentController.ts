import { Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ICreateSubscriptionUseCase } from "../../application/interface/useCases/ICreateSubscriptionUseCase";
import { IVerifyPaymentUseCase } from "../../application/interface/useCases/IVerifyPaymentUseCase";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthenticatedRequest } from "../middleware/types/AuthenticatedRequest";
import { ValidationError } from "../../domain/errors/CommonErrors";

@injectable()
export class PaymentController {
  constructor(
    @inject(TYPES.ICreateSubscriptionUseCase)
    private _createSubscriptionUC: ICreateSubscriptionUseCase,
    @inject(TYPES.IVerifyPaymentUseCase)
    private _verifyPaymentUC: IVerifyPaymentUseCase,
  ) {}

  private sendSuccess<T>(
    res: Response,
    data: T,
    message: string = "Success",
    status: number = StatusCodes.OK,
  ): void {
    res.status(status).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  createSubscription = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { planId } = req.body;
      const userId = req.user!.id;

      if (!planId) {
        throw new ValidationError("Plan ID is required");
      }

      const subscription = await this._createSubscriptionUC.execute(
        userId,
        planId,
      );
      this.sendSuccess(res, subscription, "Subscription initiated");
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
        throw new ValidationError("Missing payment details");
      }

      const isValid = await this._verifyPaymentUC.execute(
        orderId,
        razorpay_payment_id,
        razorpay_signature,
        orgId,
      );

      if (isValid) {
        this.sendSuccess(
          res,
          null,
          "Payment verified and subscription updated",
        );
      } else {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ success: false, message: "Invalid signature" });
      }
    },
  );
}
