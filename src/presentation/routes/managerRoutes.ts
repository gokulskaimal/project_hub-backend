import { Router } from "express";
import { Container } from "inversify";
import { ManagerController } from "../controllers/ManagerController";
import { TYPES } from "../../infrastructure/container/types";
import { authMiddleware } from "../middleware/AuthMiddleware";
import { roleMiddleware } from "../middleware/RoleMiddleware";
import { UserRole } from "../../domain/enums/UserRole";
import { AuthenticatedRequest } from "../middleware/types/AuthenticatedRequest";
import { API_ROUTES } from "./constants";

export function createManagerRoutes(container: Container): Router {
  const router = Router();
  const controller = container.get<ManagerController>(TYPES.ManagerController);

  // Protect all manager routes
  router.use("/manager", authMiddleware, roleMiddleware(UserRole.ORG_MANAGER));

  router.get(API_ROUTES.MANAGER.MEMBERS, (req, res, next) =>
    controller.listMembers(req as AuthenticatedRequest, res, next),
  );
  router.delete(`${API_ROUTES.MANAGER.MEMBERS}/:id`, (req, res, next) =>
    controller.removeMember(req as AuthenticatedRequest, res, next),
  );
  router.put(`${API_ROUTES.MANAGER.MEMBERS}/:id/status`, (req, res, next) =>
    controller.updateMemberStatus(req as AuthenticatedRequest, res, next),
  );

  router.post(API_ROUTES.MANAGER.INVITE, (req, res, next) =>
    controller.inviteMember(req as AuthenticatedRequest, res, next),
  );
  router.post(API_ROUTES.MANAGER.BULK_INVITE, (req, res, next) =>
    controller.bulkInvite(req as AuthenticatedRequest, res, next),
  );

  router.get(API_ROUTES.MANAGER.INVITATIONS, (req, res, next) =>
    controller.listInvitations(req as AuthenticatedRequest, res, next),
  );
  router.delete(`${API_ROUTES.MANAGER.INVITATIONS}/:token`, (req, res, next) =>
    controller.cancelInvitation(req as AuthenticatedRequest, res, next),
  );

  return router;
}
