import { Router } from "express";
import { Container } from "inversify";
import { WebhookController } from "../controllers/WebhookController";
import { TYPES } from "../../infrastructure/container/types";
import { API_ROUTES } from "../../infrastructure/config/apiRoutes.constant";

export function createWebhookRoutes(container: Container): Router {
  const router = Router();
  const controller = container.get<WebhookController>(TYPES.WebhookController);

  router.post(API_ROUTES.WEBHOOKS.RAZORPAY, (req, res, next) => {
    controller.handleWebhook(req, res, next);
  });
  return router;
}
