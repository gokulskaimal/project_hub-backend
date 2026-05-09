import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IRazorpayService } from "../../application/interface/services/IRazorpayService";
import { IHandleRazorpayWebhookUseCase } from "../../application/interface/useCases/IHandleRazorpayWebhookUseCase";
import { ResponseHandler } from "../utils/ResponseHandler";
import { asyncHandler } from "../../utils/asyncHandler";
import crypto from "crypto";
import { ILogger } from "../../application/interface/services/ILogger";
import { AppConfig } from "../../config/AppConfig";

@injectable()
export class WebhookController {
  constructor(
    @inject(TYPES.IRazorpayService) private _razorpayService: IRazorpayService,
    @inject(TYPES.IHandleRazorpayWebhookUseCase)
    private _handleWebhookUC: IHandleRazorpayWebhookUseCase,
    @inject(TYPES.ILogger) private logger: ILogger,
    @inject(TYPES.AppConfig) private config: AppConfig,
  ) {}

  handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    const secret = this.config.razorpay.webhookSecret;
    if (!secret) {
      return ResponseHandler.serverError(res, "Webhook secret not configured");
    }

    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      return ResponseHandler.validationError(res, "Signature not found");
    }
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest !== signature) {
      this.logger.warn("Invalid Razorpay Webhook Signature");
      return ResponseHandler.validationError(res, "Invalid signature");
    }

    const { event, payload } = req.body;
    this.logger.info(`Received Webhook Event: ${event}`);
    await this._handleWebhookUC.execute(event, payload.subscription.entity);
    return ResponseHandler.success(res, null, "Webhook processed successfully");
  });
}
