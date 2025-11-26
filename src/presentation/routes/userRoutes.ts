import { Router } from "express";
import { Container } from "inversify";
import { UserController } from "../controllers/UserController";
import { TYPES } from "../../infrastructure/container/types";
import { authMiddleware } from "../middleware/AuthMiddleware";
import { AuthenticatedRequest } from "../middleware/types/AuthenticatedRequest";
import { API_ROUTES } from "./constants";

export function createUserRoutes(container: Container): Router {
  const router = Router();
  const controller = container.get<UserController>(TYPES.UserController);

  // Protect all user routes
  router.use(authMiddleware);

  router.get(API_ROUTES.USER.PROFILE, (req, res, next) => {
    console.log("UserRoutes: Reached /user/profile handler");
    controller.getProfile(req as AuthenticatedRequest, res, next);
  });
  router.put(API_ROUTES.USER.PROFILE, (req, res, next) =>
    controller.updateProfile(req as AuthenticatedRequest, res, next),
  );
  router.post(API_ROUTES.USER.CHANGE_PASSWORD, (req, res, next) =>
    controller.changePassword(req as AuthenticatedRequest, res, next),
  );
  router.delete("/account", (req, res, next) =>
    controller.deleteAccount(req as AuthenticatedRequest, res, next),
  );

  return router;
}
