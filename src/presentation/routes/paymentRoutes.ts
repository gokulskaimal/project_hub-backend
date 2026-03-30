import { Router } from "express";
import { Container } from "inversify";
import { PaymentController } from "../controllers/PaymentController";
import { TYPES } from "../../infrastructure/container/types";
import { authMiddleware } from "../middleware/AuthMiddleware";
import { AuthenticatedRequest } from "../middleware/types/AuthenticatedRequest";
import { API_ROUTES } from "../../infrastructure/config/apiRoutes.constant";

export function createPaymentRoutes(container: Container): Router {
  const router = Router();
  const controller = container.get<PaymentController>(TYPES.PaymentController);

  router.use(API_ROUTES.PAYMENT.BASE, authMiddleware);

  router.post(API_ROUTES.PAYMENT.SUBSCRIPTION, (req, res, next) =>
    controller.createSubscription(req as AuthenticatedRequest, res, next),
  );

  router.post(API_ROUTES.PAYMENT.VERIFY, (req, res, next) =>
    controller.verifyPayment(req as AuthenticatedRequest, res, next),
  );

  return router;
}
