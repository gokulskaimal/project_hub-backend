import { Router } from "express";
import { Container } from "inversify";
import { AdminController } from "../controllers/AdminController";
import { TYPES } from "../../infrastructure/container/types";
import { authMiddleware } from "../middleware/AuthMiddleware";
import { roleMiddleware } from "../middleware/RoleMiddleware";
import { UserRole } from "../../domain/enums/UserRole";
import { API_ROUTES } from "./constants";
import { AuthenticatedRequest } from "../middleware/types/AuthenticatedRequest";

export function createAdminRoutes(container: Container): Router {
  const router = Router();
  const controller = container.get<AdminController>(TYPES.AdminController);

  // Protect all admin routes
  router.use("/admin", authMiddleware, roleMiddleware(UserRole.SUPER_ADMIN));

  // Organizations
  router.get(API_ROUTES.ADMIN.ORGANIZATIONS, (req, res, next) =>
    controller.listOrganizations(req as AuthenticatedRequest, res, next),
  );
  router.post(API_ROUTES.ADMIN.ORGANIZATIONS, (req, res, next) =>
    controller.createOrganization(req as AuthenticatedRequest, res, next),
  );
  router.put(`${API_ROUTES.ADMIN.ORGANIZATIONS}/:id`, (req, res, next) =>
    controller.updateOrganization(req as AuthenticatedRequest, res, next),
  );
  router.delete(`${API_ROUTES.ADMIN.ORGANIZATIONS}/:id`, (req, res, next) =>
    controller.deleteOrganization(req as AuthenticatedRequest, res, next),
  );

  // Users
  router.get(API_ROUTES.ADMIN.USERS, (req, res, next) =>
    controller.listUsers(req as AuthenticatedRequest, res, next),
  );
  router.delete(`${API_ROUTES.ADMIN.USERS}/:id`, (req, res, next) =>
    controller.deleteUser(req as AuthenticatedRequest, res, next),
  );
  router.put(`${API_ROUTES.ADMIN.USERS}/:id/status`, (req, res, next) =>
    controller.updateUserStatus(req as AuthenticatedRequest, res, next),
  );

  // Specific actions
  router.get(API_ROUTES.ADMIN.REPORTS, (req, res, next) =>
    controller.getReports(req as AuthenticatedRequest, res, next),
  );
  router.post("/invite-member", (req, res, next) =>
    controller.inviteMember(req as AuthenticatedRequest, res, next),
  );
  router.post("/bulk-invite", (req, res, next) =>
    controller.bulkInviteMembers(req as AuthenticatedRequest, res, next),
  );

  return router;
}
