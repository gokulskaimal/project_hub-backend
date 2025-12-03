import { injectable } from "inversify";
import Razorpay from "razorpay";
import crypto from "crypto";
import {
  IRazorpayService,
  RazorpayOrder,
  RazorpaySubscription,
} from "../interface/services/IRazorpayService";

@injectable()
export class RazorpayService implements IRazorpayService {
  private readonly _razorpay: Razorpay | null = null;
  private readonly isMock: boolean = true; // Force mock mode

  constructor() {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    // We initialize Razorpay if keys exist, but we will use mock methods primarily
    if (key_id && key_secret) {
      this._razorpay = new Razorpay({
        key_id,
        key_secret,
      });
    } else {
      console.warn("Razorpay Keys missing. Running in pure Mock mode.");
    }
  }

  async createOrder(
    amount: number,
    currency: string,
    receipt: string,
  ): Promise<RazorpayOrder> {
    console.log(`[MOCK] createOrder: amount=${amount}, currency=${currency}`);
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
    console.log(
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
      (signature && signature.startsWith("sig_mock_"))
    ) {
      console.log("[MOCK] verifySignature: Verified mock signature");
      return true;
    }

    // Also support subscription verification where orderId might be subscription_id
    if (orderId.startsWith("sub_mock_")) {
      console.log("[MOCK] verifySignature: Verified mock subscription");
      return true;
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) return false;

    try {
      const generated_signature = crypto
        .createHmac("sha256", key_secret)
        .update(orderId + "|" + paymentId)
        .digest("hex");

      return generated_signature === signature;
    } catch (e) {
      console.error("Signature verification failed", e);
      return false;
    }
  }

  async createCustomer(
    name: string,
    email: string,
    contact?: string,
  ): Promise<string> {
    console.log(
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
    console.log(
      `[MOCK] createPlan: ${name} - ${amount} ${currency} (${interval} ${period})`,
    );
    return `plan_mock_${name.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;
  }
}
