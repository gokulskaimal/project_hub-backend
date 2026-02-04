import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ChatController } from "../controllers/ChatController";
import { authMiddleware } from "../middleware/AuthMiddleware";

export function createChatRoutes(container: Container): Router {
  const router = Router();
  const controller = container.get<ChatController>(TYPES.ChatController);

  router.post("/:projectId", authMiddleware, controller.sendMessage);
  router.get("/:projectId", authMiddleware, controller.getMessages);
  router.put("/:messageId", authMiddleware, controller.editMessage);
  router.delete("/:messageId", authMiddleware, controller.deleteMessage);

  return router;
}
