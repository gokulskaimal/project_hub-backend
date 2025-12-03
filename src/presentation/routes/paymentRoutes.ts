import { Router } from "express";
import { Container } from "inversify";
import { PaymentController } from "../controllers/PaymentController";
import { TYPES } from "../../infrastructure/container/types";
import { authMiddleware } from "../middleware/AuthMiddleware";

export function createPaymentRoutes(container: Container): Router {
  const router = Router();
  const controller = container.get<PaymentController>(TYPES.PaymentController);

  router.post("/subscription", authMiddleware, (req, res, next) =>
    controller.createSubscription(req, res, next),
  );

  router.post("/verify", (req, res, next) =>
    controller.verifyPayment(req, res, next),
  );

  return router;
}
