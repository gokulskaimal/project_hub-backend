import { injectable, inject } from "inversify";
import Razorpay from "razorpay";
import crypto from "crypto";
import {
  IRazorpayService,
  RazorpayOrder,
  RazorpaySubscription,
} from "../interface/services/IRazorpayService";
import { TYPES } from "../container/types";
import { ILogger } from "../interface/services/ILogger";

@injectable()
export class RazorpayService implements IRazorpayService {
  private readonly _razorpay: Razorpay | null = null;

  constructor(
    @inject(TYPES.ILogger) private readonly _logger: ILogger
  ) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (key_id && key_secret) {
      this._razorpay = new Razorpay({
        key_id,
        key_secret,
      });
      this._logger.info("Razorpay initialized in LIVE/TEST mode");
    } else {
      this._logger.warn("Razorpay Keys missing. Running in MOCK mode.");
    }
  }

  async createOrder(
    amount: number,
    currency: string,
    receipt: string,
  ): Promise<RazorpayOrder> {
    if (this._razorpay) {
      try {
        const order = await this._razorpay.orders.create({
          amount: Math.round(amount * 100), // Razorpay expects paise
          currency,
          receipt,
        });
        return order as unknown as RazorpayOrder;
      } catch (error) {
        this._logger.error("Razorpay createOrder failed", error as Error);
        throw error;
      }
    }

    this._logger.info(`[MOCK] createOrder: amount=${amount}, currency=${currency}`);
    return {
      id: `order_mock_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency,
      receipt,
      status: "created",
      created_at: Math.floor(Date.now() / 1000),
    };
  }

  async createSubscription(
    planId: string,
    totalCount: number,
    customerId?: string,
  ): Promise<RazorpaySubscription> {
    if (this._razorpay) {
      try {
        const options = {
          plan_id: planId,
          total_count: totalCount,
          customer_id: customerId,
          quantity: 1,
          addons: [],
          notes: {},
        };
        const subscription = await this._razorpay.subscriptions.create(options);
        return subscription as unknown as RazorpaySubscription;
      } catch (error) {
        this._logger.error("Razorpay createSubscription failed", error as Error);
        throw error;
      }
    }

    this._logger.info(
      `[MOCK] createSubscription: planId=${planId}, customerId=${customerId}`,
    );
    return {
      id: `sub_mock_${Date.now()}`,
      plan_id: planId,
      customer_id: customerId || `cust_mock_${Date.now()}`,
      status: "created",
      created_at: Math.floor(Date.now() / 1000),
    };
  }

  verifySignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    // If it's a mock ID, always return true
    if (
      orderId.startsWith("order_mock_") ||
      paymentId.startsWith("pay_mock_") ||
      (signature && signature.startsWith("sig_mock_")) ||
      orderId.startsWith("sub_mock_") ||
      orderId.startsWith("sub_free_")
    ) {
      this._logger.info("[MOCK] verifySignature: Verified mock signature");
      return true;
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) return false;

    try {
      // For subscriptions, the order is payment_id + "|" + subscription_id
      // For orders, the order is order_id + "|" + payment_id
      // We detect subscription by "sub_" prefix in orderId (which is passed as subscription_id from controller)
      const message = orderId.startsWith("sub_")
        ? paymentId + "|" + orderId
        : orderId + "|" + paymentId;

      const generated_signature = crypto
        .createHmac("sha256", key_secret)
        .update(message)
        .digest("hex");

      return generated_signature === signature;
    } catch (e) {
      this._logger.error("Signature verification failed", e as Error);
      return false;
    }
  }

  async createCustomer(
    name: string,
    email: string,
    contact?: string,
  ): Promise<string> {
    if (this._razorpay) {
      try {
        const customer = await this._razorpay.customers.create({
          name,
          email,
          contact,
        });
        return customer.id;
      } catch (error) {
        this._logger.error("Razorpay createCustomer failed", error as Error);
        throw error;
      }
    }

    this._logger.info(
      `[MOCK] createCustomer: ${name} (${email}), contact=${contact || "N/A"}`,
    );
    return `cust_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }

  async createPlan(
    name: string,
    description: string,
    amount: number,
    currency: string,
    period: "daily" | "weekly" | "monthly" | "yearly",
    interval: number,
  ): Promise<string> {
    if (this._razorpay) {
      try {
        const plan = await this._razorpay.plans.create({
          item: {
            name,
            description,
            amount: Math.round(amount * 100),
            currency,
          },
          period,
          interval,
        });
        return plan.id;
      } catch (error) {
        this._logger.error("Razorpay createPlan failed", error as Error);
        throw error;
      }
    }

    this._logger.info(
      `[MOCK] createPlan: ${name} - ${amount} ${currency} (${interval} ${period})`,
    );
    return `plan_mock_${name.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;
  }

  async fetchSubscription(
    subscriptionId: string,
  ): Promise<RazorpaySubscription | null> {
    if (subscriptionId.startsWith("sub_mock_")) {
      this._logger.info(`[MOCK] fetchSubscription: ${subscriptionId}`);
      return {
        id: subscriptionId,
        plan_id: "plan_mock_pro_123",
        status: "active",
        current_start: Math.floor(Date.now() / 1000),
        current_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
        created_at: Math.floor(Date.now() / 1000),
      };
    }

    if (!this._razorpay) return null;

    try {
      const sub = await this._razorpay.subscriptions.fetch(subscriptionId);
      return sub as unknown as RazorpaySubscription;
    } catch (error) {
      this._logger.error("Failed to fetch subscription from Razorpay", error as Error);
      return null;
    }
  }
}
