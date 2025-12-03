import { injectable } from "inversify";
import Stripe from "stripe";
import { IStripeService } from "../interface/services/IStripeService";
@injectable()
export class StripeService implements IStripeService {
  private readonly _stripe: Stripe;
  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error("STRIPE_SECRET_KEY is not defined");
    }
    this._stripe = new Stripe(apiKey, {
      apiVersion: "2025-11-17.clover",
    });
  }
  async createCustomer(email: string, name: string): Promise<string> {
    const customer = await this._stripe.customers.create({
      email,
      name,
    });
    return customer.id;
  }
  async createProduct(name: string, description: string): Promise<string> {
    const product = await this._stripe.products.create({
      name,
      description,
    });
    return product.id;
  }
  async createPrice(
    productId: string,
    amount: number,
    currency: string,
  ): Promise<string> {
    const price = await this._stripe.prices.create({
      product: productId,
      unit_amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      recurring: {
        interval: "month",
      },
    });
    return price.id;
  }
  async createSubscriptionCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    metadata?: Record<string, string>,
  ): Promise<string> {
    const session = await this._stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"], // Fixed typo: payment_method_type -> payment_method_types
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });
    if (!session.url) {
      throw new Error("Failed to create checkout session URL");
    }
    return session.url;
  }
  async createPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<string> {
    const session = await this._stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session.url;
  }
  constructEvent(payload: string | Buffer, signature: string): Stripe.Event {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!endpointSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not defined");
    }
    return this._stripe.webhooks.constructEvent(
      payload,
      signature,
      endpointSecret,
    );
  }
}
