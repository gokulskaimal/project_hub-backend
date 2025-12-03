import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ICreateSubscriptionUseCase } from "../../application/interface/useCases/ICreateSubscriptionUseCase";
import { IVerifyPaymentUseCase } from "../../application/interface/useCases/IVerifyPaymentUseCase";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
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
        throw {
          status: StatusCodes.BAD_REQUEST,
          message: "Plan ID is required",
        };
      }

      const subscription = await this._createSubscriptionUC.execute(
        userId,
        planId,
      );
      res.status(StatusCodes.OK).json({
        success: true,
        data: subscription,
      });
    },
  );

  verifyPayment = asyncHandler(async (req: Request, res: Response) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw {
        status: StatusCodes.BAD_REQUEST,
        message: "Missing payment details",
      };
    }

    const isValid = await this._verifyPaymentUC.execute(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    if (isValid) {
      res
        .status(StatusCodes.OK)
        .json({ success: true, message: "Payment verified" });
    } else {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: "Invalid signature" });
    }
  });
}
