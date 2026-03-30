export interface IWebhookEventHandler {
  handle(payload: unknown): Promise<void>;
}
