import { Router } from "express";
import { Container } from "inversify";
import { OrganizationController } from "../controllers/OrganizationController";
import { TYPES } from "../../infrastructure/container/types";
import { AuthenticatedRequest } from "../middleware/types/AuthenticatedRequest";
import { authMiddleware } from "../middleware/AuthMiddleware";

export function createOrganizationRoutes(container: Container): Router {
  const router = Router();
  const controller = container.get<OrganizationController>(
    TYPES.OrganizationController,
  );

  // Protect all routes
  router.use(authMiddleware);

  router.get("/me", (req, res, next) =>
    controller.getMyOrganization(req as AuthenticatedRequest, res, next),
  );
  router.put("/me", (req, res, next) =>
    controller.updateOrganization(req as AuthenticatedRequest, res, next),
  );
  router.get("/users", (req, res, next) =>
    controller.getOrganizationUsers(req as AuthenticatedRequest, res, next),
  );

  return router;
}
