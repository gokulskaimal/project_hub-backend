import Stripe from "stripe";

export interface IStripeService {
  createCustomer(email: string, name: string): Promise<string>;
  createProduct(name: string, description: string): Promise<string>;
  createPrice(
    productId: string,
    price: number,
    currency: string,
  ): Promise<string>;
  createSubscriptionCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    metadata?: Record<string, string>,
  ): Promise<string>;
  createPortalSession(customerId: string, returnUrl: string): Promise<string>;
  constructEvent(payload: string | Buffer, signature: string): Stripe.Event;
}
