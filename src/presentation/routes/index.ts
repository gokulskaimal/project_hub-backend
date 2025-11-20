import express, { Request, Response, NextFunction } from "express";
import { diContainer } from "../../infrastructure/container/Container";
import { TYPES } from "../../infrastructure/container/types";
import { AuthController } from "../controllers/AuthController";
import { AdminController } from "../controllers/AdminController";
import { ManagerController } from "../controllers/ManagerController";
import { UserController } from "../controllers/UserController";
import { authMiddleware } from "../middleware/AuthMiddleware";
import { roleMiddleware } from "../middleware/RoleMiddleware";
import { UserRole } from "../../domain/enums/UserRole";
import { AuthenticatedRequest } from "../middleware/types/AuthenticatedRequest";

/**
 * Route
 */
export class RouteFactory {
  private readonly _authController: AuthController;
  private readonly _adminController: AdminController;
  private readonly _userController: UserController;
  private readonly _managerController: ManagerController;

  constructor() {
    // Resolve controllers from DI container
    this._authController = diContainer.get<AuthController>(
      TYPES.AuthController,
    );
    this._adminController = diContainer.get<AdminController>(
      TYPES.AdminController,
    );
    this._userController = diContainer.get<UserController>(
      TYPES.UserController,
    );
    this._managerController = diContainer.get<ManagerController>(
      TYPES.ManagerController,
    );
  }

  /**
   * Create authentication routes
   * @returns Express Router with auth routes
   */
  public createAuthRoutes(): express.Router {
    const router = express.Router();

    // Test route
    router.get("/test", (req, res) => {
      res.json({
        message: "Auth routes working with DI!",
        timestamp: new Date().toISOString(),
      });
    });

    // Authentication routes
    router.post("/login", (req: Request, res: Response, next: NextFunction) =>
      this._authController.login(req, res, next),
    );
    router.post(
      "/register",
      (req: Request, res: Response, next: NextFunction) =>
        this._authController.register(req, res, next),
    );
    router.post(
      "/register-manager",
      (req: Request, res: Response, next: NextFunction) =>
        this._authController.registerManager(req, res, next),
    );
    router.post("/logout", (req: Request, res: Response, next: NextFunction) =>
      this._authController.logout(req, res, next),
    );

    // Token management
    router.post(
      "/refresh-token",
      (req: Request, res: Response, next: NextFunction) =>
        this._authController.refreshToken(req, res, next),
    );

    // Email verification
    router.post(
      "/verify-email",
      (req: Request, res: Response, next: NextFunction) =>
        this._authController.verifyEmail(req, res, next),
    );

    // OTP routes
    router.post(
      "/send-otp",
      (req: Request, res: Response, next: NextFunction) =>
        this._authController.sendOtp(req, res, next),
    );
    router.post(
      "/verify-otp",
      (req: Request, res: Response, next: NextFunction) =>
        this._authController.verifyOtp(req, res, next),
    );

    // Password reset
    router.post(
      "/reset-password-request",
      (req: Request, res: Response, next: NextFunction) =>
        this._authController.resetPasswordReq(req, res, next),
    );
    router.post(
      "/reset-password",
      (req: Request, res: Response, next: NextFunction) =>
        this._authController.resetPassword(req, res, next),
    );

    // Signup completion
    router.post(
      "/complete-signup",
      (req: Request, res: Response, next: NextFunction) =>
        this._authController.completeSignup(req, res, next),
    );

    // Invitation handling
    router.post(
      "/accept-invite",
      (req: Request, res: Response, next: NextFunction) =>
        this._authController.acceptInvite(req, res, next),
    );
    router.get(
      "/validate-invite/:token",
      (req: Request, res: Response, next: NextFunction) =>
        this._authController.validateInviteToken(req, res, next),
    );

    // Member invitation (might move to organization routes)
    router.post(
      "/invite-member",
      (req: Request, res: Response, next: NextFunction) =>
        this._authController.inviteMember(req, res, next),
    );

    return router;
  }

  /**
   * Create manager routes (protected: ORG_MANAGER)
   */
  public createManagerRoutes(): express.Router {
    const router = express.Router();

    // Guard all routes
    router.use(authMiddleware, roleMiddleware(UserRole.ORG_MANAGER));

    // Members
    router.get("/members", (req, res) =>
      this._managerController.listMembers(req as AuthenticatedRequest, res),
    );
    // router.get("/members/:id", (req, res) =>
    //   this._managerController.getMemberById(req as AuthenticatedRequest, res),
    // );
    router.put("/members/:id/status", (req, res) =>
      this._managerController.updateMemberStatus(
        req as AuthenticatedRequest,
        res,
      ),
    );
    router.delete("/members/:id", (req, res) =>
      this._managerController.removeMember(req as AuthenticatedRequest, res),
    );

    // Invitations
    router.post("/invite", (req, res) =>
      this._managerController.inviteMember(req as AuthenticatedRequest, res),
    );
    router.post("/bulk-invite", (req, res) =>
      this._managerController.bulkInvite(req as AuthenticatedRequest, res),
    );
    router.get("/invitations", (req, res) =>
      this._managerController.listInvitations(req as AuthenticatedRequest, res),
    );
    router.delete("/invitations/:token", (req, res) =>
      this._managerController.cancelInvitation(
        req as AuthenticatedRequest,
        res,
      ),
    );

    return router;
  }

  /**
   * Create admin routes
   * @returns Express Router with admin routes
   */
  public createAdminRoutes(): express.Router {
    const router = express.Router();

    // Test route
    router.get("/test", (req, res) => {
      res.json({
        message: "Admin routes working with DI!",
        timestamp: new Date().toISOString(),
      });
    });

    // Protect all admin routes with auth + SUPER_ADMIN role
    router.use(authMiddleware, roleMiddleware(UserRole.SUPER_ADMIN));

    // Organization management
    router.get("/organizations", (req, res) =>
      this._adminController.listOrganizations(req, res),
    );
    router.post("/organizations", (req, res) =>
      this._adminController.createOrganization(req, res),
    );
    router.get("/organizations/:id", (req, res) =>
      this._adminController.getOrganizationById(req, res),
    );
    router.put("/organizations/:id", (req, res) =>
      this._adminController.updateOrganization(req, res),
    );
    router.delete("/organizations/:id", (req, res) =>
      this._adminController.deleteOrganization(req, res),
    );

    // User management
    router.get("/users", (req, res) =>
      this._adminController.listUsers(req, res),
    );
    router.get("/users/:id", (req, res) =>
      this._adminController.getUserById(req, res),
    );
    router.put("/users/:id", (req, res) =>
      this._adminController.updateUser(req, res),
    );
    router.put("/users/:id/status", (req, res) =>
      this._adminController.updateUserStatus(req, res),
    );
    router.delete("/users/:id", (req, res) =>
      this._adminController.deleteUser(req, res),
    );

    // Organization user management
    router.get("/organizations/:orgId/users", (req, res) =>
      this._adminController.getUsersByOrganization(req, res),
    );

    // Member invitations
    router.post("/invite-member", (req, res) =>
      this._adminController.inviteMember(req, res),
    );
    router.post("/bulk-invite", (req, res) =>
      this._adminController.bulkInviteMembers(req, res),
    );

    // Reports and statistics
    router.get("/reports", (req, res) =>
      this._adminController.getReports(req, res),
    );
    router.get("/dashboard-stats", (req, res) =>
      this._adminController.getDashboardStats(req, res),
    );

    return router;
  }

  /**
   * Create organization routes (for regular users)
   * @returns Express Router with organization routes
   */
  public createOrganizationRoutes(): express.Router {
    const router = express.Router();

    // Basic organization operations
    router.get("/", (req, res) => {
      // TODO: This should use OrganizationController when created
      res.json({
        message: "Organization routes - coming soon!",
        timestamp: new Date().toISOString(),
      });
    });

    return router;
  }

  /**
   * Create project routes
   * @returns Express Router with project routes
   */
  public createProjectRoutes(): express.Router {
    const router = express.Router();

    // Basic project operations
    router.get("/", (req, res) => {
      // TODO: This should use ProjectController when created
      res.json({
        message: "Project routes - coming soon!",
        timestamp: new Date().toISOString(),
      });
    });

    return router;
  }

  /**
   * Create user routes
   * @returns Express Router with user routes
   */
  public createUserRoutes(): express.Router {
    const router = express.Router();

    // Protect all user routes with auth
    router.use(authMiddleware);

    // User profile management
    router.get("/profile", (req, res) =>
      this._userController.getProfile(req, res),
    );
    router.put("/profile", (req, res) =>
      this._userController.updateProfile(req, res),
    );
    router.post("/change-password", (req, res) =>
      this._userController.changePassword(req as AuthenticatedRequest, res),
    );
    router.delete("/account", (req, res) =>
      this._userController.deleteAccount(req as AuthenticatedRequest, res),
    );

    return router;
  }

  /**
   * Create all routes and return them as an object
   * @returns Object containing all route routers
   */
  public createAllRoutes() {
    return {
      auth: this.createAuthRoutes(),
      admin: this.createAdminRoutes(),
      organizations: this.createOrganizationRoutes(),
      projects: this.createProjectRoutes(),
      user: this.createUserRoutes(),
      manager: this.createManagerRoutes(),
    };
  }
}

/**
 * Factory function to create routes with dependency injection
 * @returns Object containing all route routers
 */
export function createRoutes() {
  const routeFactory = new RouteFactory();
  return routeFactory.createAllRoutes();
}
