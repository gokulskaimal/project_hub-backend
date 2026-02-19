import { Router } from "express";
import { Container } from "inversify";
import { OrganizationController } from "../controllers/OrganizationController";
import { TYPES } from "../../infrastructure/container/types";
import { AuthenticatedRequest } from "../middleware/types/AuthenticatedRequest";
import { authMiddleware } from "../middleware/AuthMiddleware";
import { API_ROUTES } from "../../infrastructure/config/apiRoutes.constant";

export function createOrganizationRoutes(container: Container): Router {
  const router = Router();
  const controller = container.get<OrganizationController>(
    TYPES.OrganizationController,
  );

  // Protect all routes
  router.use(API_ROUTES.ORG.BASE, authMiddleware);

  router.get(API_ROUTES.ORG.ME, (req, res, next) =>
    controller.getMyOrganization(req as AuthenticatedRequest, res, next),
  );
  router.put(API_ROUTES.ORG.ME, (req, res, next) =>
    controller.updateOrganization(req as AuthenticatedRequest, res, next),
  );
  router.get(API_ROUTES.ORG.USERS, (req, res, next) =>
    controller.getOrganizationUsers(req as AuthenticatedRequest, res, next),
  );

  return router;
}
