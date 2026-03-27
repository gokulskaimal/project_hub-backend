import { Router } from "express";
import { Container } from "inversify";
import { UserController } from "../controllers/user/UserController";
import { TYPES } from "../../infrastructure/container/types";
import { authMiddleware } from "../middleware/AuthMiddleware";
import { AuthenticatedRequest } from "../middleware/types/AuthenticatedRequest";
import { API_ROUTES } from "../../infrastructure/config/apiRoutes.constant";

export function createUserRoutes(container: Container): Router {
  const router = Router();
  const controller = container.get<UserController>(TYPES.UserController);

  router.use(API_ROUTES.USER.BASE, authMiddleware);

  router.get(API_ROUTES.USER.PROFILE, (req, res, next) =>
    controller.getProfile(req as AuthenticatedRequest, res, next),
  );
  router.put(API_ROUTES.USER.PROFILE, (req, res, next) =>
    controller.updateProfile(req as AuthenticatedRequest, res, next),
  );
  router.post(API_ROUTES.USER.CHANGE_PASSWORD, (req, res, next) =>
    controller.changePassword(req as AuthenticatedRequest, res, next),
  );
  router.get(API_ROUTES.USER.VELOCITY, (req, res, next) =>
    controller.getVelocity(req as AuthenticatedRequest, res, next),
  );
  router.delete(API_ROUTES.USER.DELETE_ACCOUNT, (req, res, next) =>
    controller.deleteAccount(req as AuthenticatedRequest, res, next),
  );

  return router;
}
