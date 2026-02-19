import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ChatController } from "../controllers/ChatController";
import { authMiddleware } from "../middleware/AuthMiddleware";
import { API_ROUTES } from "../../infrastructure/config/apiRoutes.constant";

export function createChatRoutes(container: Container): Router {
  const router = Router();
  const controller = container.get<ChatController>(TYPES.ChatController);

  router.use(API_ROUTES.CHAT.BASE, authMiddleware);

  router.post(API_ROUTES.CHAT.SEND(":projectId"), controller.sendMessage);
  router.get(
    API_ROUTES.CHAT.GET_MESSAGES(":projectId"),
    controller.getMessages,
  );
  router.put(API_ROUTES.CHAT.EDIT(":messageId"), controller.editMessage);
  router.delete(API_ROUTES.CHAT.DELETE(":messageId"), controller.deleteMessage);

  return router;
}
