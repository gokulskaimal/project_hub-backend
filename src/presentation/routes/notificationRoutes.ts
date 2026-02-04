import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { authMiddleware } from "../middleware/AuthMiddleware";
import { NotificationController } from "../controllers/NotificationController";

export function createNotificationRoutes(container: Container): Router {
  const router = Router();
  const controller = container.get<NotificationController>(
    TYPES.NotificationController,
  );

  router.use(authMiddleware);

  router.get("/", controller.getNotification.bind(controller));
  router.put("/read-all", controller.markAllRead.bind(controller));
  router.put("/:id/read", controller.markRead.bind(controller));

  return router;
}
