import { Router } from "express";
import { Container } from "inversify";
import { WebhookController } from "../controllers/WebhookController";
import { TYPES } from "../../infrastructure/container/types";

export function createWebhookRoutes(container: Container): Router {
  const router = Router();
  const controller = container.get<WebhookController>(TYPES.WebhookController);

  router.post("/razorpay", (req, res, next) => {
    controller.handleWebhook(req, res, next);
  });
  return router;
}
