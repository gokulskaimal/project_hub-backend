import { Router } from "express";
import { Container } from "inversify";
import { PaymentController } from "../controllers/PaymentController";
import { TYPES } from "../../infrastructure/container/types";
import { authMiddleware } from "../middleware/AuthMiddleware";

import { AuthenticatedRequest } from "../middleware/types/AuthenticatedRequest";

export function createPaymentRoutes(container: Container): Router {
  const router = Router();
  const controller = container.get<PaymentController>(TYPES.PaymentController);

  router.post("/subscription", authMiddleware, (req, res, next) =>
    controller.createSubscription(req as AuthenticatedRequest, res, next),
  );

  router.post("/verify", authMiddleware, (req, res, next) =>
    controller.verifyPayment(req as AuthenticatedRequest, res, next),
  );

  return router;
}
