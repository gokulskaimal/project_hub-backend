import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { authMiddleware } from "../middleware/AuthMiddleware";
import { NotificationController } from "../controllers/NotificationController";
import { API_ROUTES } from "../../infrastructure/config/apiRoutes.constant";

export function createNotificationRoutes(container: Container): Router {
  const router = Router();
  const controller = container.get<NotificationController>(
    TYPES.NotificationController,
  );

  router.use(API_ROUTES.NOTIFICATIONS.BASE, authMiddleware);

  router.get(
    API_ROUTES.NOTIFICATIONS.GET_ALL,
    controller.getNotification.bind(controller),
  );
  router.put(
    API_ROUTES.NOTIFICATIONS.READ_ALL,
    controller.markAllRead.bind(controller),
  );
  router.put(
    API_ROUTES.NOTIFICATIONS.READ_ONE(":id"),
    controller.markRead.bind(controller),
  );

  return router;
}
