import express from "express";
import { Container } from "inversify";
import { AdminController } from "../controllers/AdminController";
import { ManagerController } from "../controllers/ManagerController";
import { UserController } from "../controllers/UserController";
import { AuthController } from "../controllers/AuthController";
import { authMiddleware } from "../middleware/AuthMiddleware";
import { roleMiddleware } from "../middleware/RoleMiddleware";
import { UserRole } from "../../domain/enums/UserRole";
import { API_ROUTES } from "./constants";
import { TYPES } from "../../infrastructure/container/types";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../../infrastructure/config/common.constants";

/**
 * Create all application routes using Dependency Injection
 * @param container - Inversify DI container
 * @returns Express router with all routes
 */
export function createRoutes(container: Container): express.Router {
  const router = express.Router();

  // GET CONTROLLERS FROM DI CONTAINER (No more 'new' keyword!)
  const adminController = container.get<AdminController>(TYPES.AdminController);
  const managerController = container.get<ManagerController>(
    TYPES.ManagerController,
  );
  const userController = container.get<UserController>(TYPES.UserController);
  const authController = container.get<AuthController>(TYPES.AuthController);

  // =================================================================
  // AUTHENTICATION ROUTES (Public)
  // =================================================================

  // POST /api/auth/login
  router.post(API_ROUTES.AUTH.LOGIN, (req, res) =>
    authController.login(req, res),
  );

  // POST /api/auth/register
  router.post(API_ROUTES.AUTH.REGISTER, (req, res) =>
    authController.register(req, res),
  );

  // POST /api/auth/verify-otp
  router.post(API_ROUTES.AUTH.VERIFY_OTP, (req, res) =>
    authController.verifyOtp(req, res),
  );

  // POST /api/auth/reset-password
  router.post(API_ROUTES.AUTH.RESET_PASSWORD, (req, res) =>
    authController.requestPasswordReset(req, res),
  );

  // POST /api/auth/complete-reset
  router.post(API_ROUTES.AUTH.COMPLETE_RESET, (req, res) =>
    authController.completeReset(req, res),
  );

  // POST /api/auth/refresh-token
  router.post("/auth/refresh-token", (req, res) =>
    authController.refreshToken(req, res),
  );

  // =================================================================
  // ADMIN ROUTES (Super Admin Only)
  // =================================================================

  // GET /api/admin/organizations
  router.get(
    API_ROUTES.ADMIN.ORGANIZATIONS,
    authMiddleware,
    roleMiddleware(UserRole.SUPER_ADMIN),
    (req, res) => adminController.listOrganizations(req, res),
  );

  // POST /api/admin/organizations
  router.post(
    API_ROUTES.ADMIN.ORGANIZATIONS,
    authMiddleware,
    roleMiddleware(UserRole.SUPER_ADMIN),
    (req, res) => adminController.createOrganization(req, res),
  );

  // PUT /api/admin/organizations/:id
  router.put(
    `${API_ROUTES.ADMIN.ORGANIZATIONS}/:id`,
    authMiddleware,
    roleMiddleware(UserRole.SUPER_ADMIN),
    (req, res) => adminController.updateOrganization(req, res),
  );

  // DELETE /api/admin/organizations/:id
  router.delete(
    `${API_ROUTES.ADMIN.ORGANIZATIONS}/:id`,
    authMiddleware,
    roleMiddleware(UserRole.SUPER_ADMIN),
    (req, res) => adminController.deleteOrganization(req, res),
  );

  // GET /api/admin/users
  router.get(
    API_ROUTES.ADMIN.USERS,
    authMiddleware,
    roleMiddleware(UserRole.SUPER_ADMIN),
    (req, res) => adminController.listUsers(req, res),
  );

  // GET /api/admin/reports
  router.get(
    API_ROUTES.ADMIN.REPORTS,
    authMiddleware,
    roleMiddleware(UserRole.SUPER_ADMIN),
    (req, res) => adminController.getReports(req, res),
  );

  // =================================================================
  // MANAGER ROUTES (Organization Manager Only)
  // =================================================================

  // POST /api/manager/invite
  router.post(
    API_ROUTES.MANAGER.INVITE,
    authMiddleware,
    roleMiddleware(UserRole.ORG_MANAGER),
    (req, res) => managerController.inviteMember(req, res),
  );

  // POST /api/manager/bulk-invite
  router.post(
    API_ROUTES.MANAGER.BULK_INVITE,
    authMiddleware,
    roleMiddleware(UserRole.ORG_MANAGER),
    (req, res) => managerController.bulkInvite(req, res),
  );

  // GET /api/manager/members
  router.get(
    API_ROUTES.MANAGER.MEMBERS,
    authMiddleware,
    roleMiddleware(UserRole.ORG_MANAGER),
    (req, res) => managerController.listMembers(req, res),
  );

  // DELETE /api/manager/members/:id
  router.delete(
    `${API_ROUTES.MANAGER.MEMBERS}/:id`,
    authMiddleware,
    roleMiddleware(UserRole.ORG_MANAGER),
    (req, res) => managerController.removeMember(req, res),
  );

  // GET /api/manager/activity
  // router.get(
  //     API_ROUTES.MANAGER.ACTIVITY,
  //     authMiddleware,
  //     roleMiddleware(UserRole.ORG_MANAGER),
  //     (req, res) => managerController.getActivity(req, res)
  // );

  // GET /api/manager/invitations
  router.get(
    "/manager/invitations",
    authMiddleware,
    roleMiddleware(UserRole.ORG_MANAGER),
    (req, res) => managerController.listInvitations(req, res),
  );

  // DELETE /api/manager/invitations/:token
  router.delete(
    "/manager/invitations/:token",
    authMiddleware,
    roleMiddleware(UserRole.ORG_MANAGER),
    (req, res) => managerController.cancelInvitation(req, res),
  );

  // =================================================================
  // USER ROUTES (Authenticated Users)
  // =================================================================

  // GET /api/user/profile
  router.get(API_ROUTES.USER.PROFILE, authMiddleware, (req, res) =>
    userController.getProfile(req, res),
  );

  // PUT /api/user/profile
  router.put(API_ROUTES.USER.PROFILE, authMiddleware, (req, res) =>
    userController.updateProfile(req, res),
  );

  // POST /api/user/change-password
  router.post(API_ROUTES.USER.CHANGE_PASSWORD, authMiddleware, (req, res) =>
    userController.changePassword(req, res),
  );

  // GET /api/user/activity
  // router.get(
  //     '/user/activity',
  //     authMiddleware,
  //     (req, res) => userController.getActivityHistory(req, res)
  // );

  // DELETE /api/user/account
  router.delete("/user/account", authMiddleware, (req, res) =>
    userController.deleteAccount(req, res),
  );

  // =================================================================
  // PUBLIC ROUTES
  // =================================================================

  // GET /api/health - Health check endpoint
  router.get("/health", (req, res) => {
    res.status(StatusCodes.OK).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || "1.0.0",
      environment: process.env.NODE_ENV || "development",
    });
  });

  // GET /api/invite/:token - Public invitation acceptance page
  router.get("/invite/:token", (req, res) =>
    authController.validateInviteToken(req, res),
  );

  // POST /api/invite/:token/accept - Accept invitation
  router.post("/invite/:token/accept", (req, res) =>
    authController.acceptInvite(req, res),
  );

  // =================================================================
  // ERROR HANDLING & 404
  // =================================================================

  // Handle 404 for API routes
  router.use("*", (req, res) => {
    res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      error: COMMON_MESSAGES.NOT_FOUND,
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}

// Export default router factory function
export default createRoutes;
