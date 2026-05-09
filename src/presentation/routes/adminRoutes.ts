import { Router } from "express";
import { Container } from "inversify";
import { AdminUserController } from "../controllers/admin/AdminUserController";
import { AdminOrgController } from "../controllers/admin/AdminOrgController";
import { AdminPlanController } from "../controllers/admin/AdminPlanController";
import { IAdminInvoiceController } from "../interfaces/controllers/IAdminInvoiceController";
import { TYPES } from "../../infrastructure/container/types";
import { authMiddleware } from "../middleware/AuthMiddleware";
import { roleMiddleware } from "../middleware/RoleMiddleware";
import { UserRole } from "../../domain/enums/UserRole";
import { API_ROUTES } from "../../infrastructure/config/apiRoutes.constant";
import { AuthenticatedRequest } from "../middleware/types/AuthenticatedRequest";

export function createAdminRoutes(container: Container): Router {
  const router = Router();
  const userController = container.get<AdminUserController>(
    TYPES.AdminUserController,
  );
  const orgController = container.get<AdminOrgController>(
    TYPES.AdminOrgController,
  );
  const planController = container.get<AdminPlanController>(
    TYPES.AdminPlanController,
  );
  const invoiceController = container.get<IAdminInvoiceController>(
    TYPES.AdminInvoiceController,
  );

  router.use(
    API_ROUTES.ADMIN.BASE,
    authMiddleware,
    roleMiddleware(UserRole.SUPER_ADMIN),
  );

  // Organizations
  router.get(API_ROUTES.ADMIN.ORGANIZATIONS, (req, res, next) =>
    orgController.listOrganizations(req as AuthenticatedRequest, res, next),
  );
  router.post(API_ROUTES.ADMIN.ORGANIZATIONS, (req, res, next) =>
    orgController.createOrganization(req as AuthenticatedRequest, res, next),
  );
  router.get(`${API_ROUTES.ADMIN.ORGANIZATIONS}/:id`, (req, res, next) =>
    orgController.getOrganizationById(req as AuthenticatedRequest, res, next),
  );
  router.put(`${API_ROUTES.ADMIN.ORGANIZATIONS}/:id`, (req, res, next) =>
    orgController.updateOrganization(req as AuthenticatedRequest, res, next),
  );
  router.delete(`${API_ROUTES.ADMIN.ORGANIZATIONS}/:id`, (req, res, next) =>
    orgController.deleteOrganization(req as AuthenticatedRequest, res, next),
  );

  // Users
  router.get(API_ROUTES.ADMIN.USERS, (req, res, next) =>
    userController.listUsers(req as AuthenticatedRequest, res, next),
  );
  router.get(`${API_ROUTES.ADMIN.USERS}/:id`, (req, res, next) =>
    userController.getUserById(req as AuthenticatedRequest, res, next),
  );
  router.delete(`${API_ROUTES.ADMIN.USERS}/:id`, (req, res, next) =>
    userController.deleteUser(req as AuthenticatedRequest, res, next),
  );
  router.put(`${API_ROUTES.ADMIN.USERS}/:id`, (req, res, next) =>
    userController.updateUser(req as AuthenticatedRequest, res, next),
  );
  router.put(`${API_ROUTES.ADMIN.USERS}/:id/status`, (req, res, next) =>
    userController.updateUserStatus(req as AuthenticatedRequest, res, next),
  );

  // Reports & Invites
  router.get(API_ROUTES.ADMIN.REPORTS, (req, res, next) =>
    orgController.getReports(req as AuthenticatedRequest, res, next),
  );
  router.post(API_ROUTES.ADMIN.INVITE_MEMBER, (req, res, next) =>
    orgController.inviteMember(req as AuthenticatedRequest, res, next),
  );
  router.post(API_ROUTES.ADMIN.BULK_INVITE, (req, res, next) =>
    orgController.bulkInviteMembers(req as AuthenticatedRequest, res, next),
  );

  // Plans
  router.post(API_ROUTES.ADMIN.PLANS, (req, res, next) =>
    planController.createPlan(req as AuthenticatedRequest, res, next),
  );
  router.get(API_ROUTES.ADMIN.PLANS, (req, res, next) =>
    planController.getPlans(req as AuthenticatedRequest, res, next),
  );
  router.put(`${API_ROUTES.ADMIN.PLANS}/:id`, (req, res, next) =>
    planController.updatePlan(req as AuthenticatedRequest, res, next),
  );
  router.delete(`${API_ROUTES.ADMIN.PLANS}/:id`, (req, res, next) =>
    planController.deletePlan(req as AuthenticatedRequest, res, next),
  );

  // Invoices
  router.get(API_ROUTES.ADMIN.INVOICES, (req, res, next) =>
    invoiceController.getInvoices(req, res, next),
  );

  // Analytics
  router.get(API_ROUTES.ADMIN.ANALYTICS, (req, res, next) =>
    orgController.getAnalytics(req, res, next),
  );

  return router;
}
