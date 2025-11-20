"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteFactory = void 0;
exports.createRoutes = createRoutes;
const express_1 = __importDefault(require("express"));
const Container_1 = require("../../infrastructure/container/Container");
const types_1 = require("../../infrastructure/container/types");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const RoleMiddleware_1 = require("../middleware/RoleMiddleware");
const UserRole_1 = require("../../domain/enums/UserRole");
/**
 * Route
 */
class RouteFactory {
    constructor() {
        // Resolve controllers from DI container
        this._authController = Container_1.diContainer.get(types_1.TYPES.AuthController);
        this._adminController = Container_1.diContainer.get(types_1.TYPES.AdminController);
        this._userController = Container_1.diContainer.get(types_1.TYPES.UserController);
        this._managerController = Container_1.diContainer.get(types_1.TYPES.ManagerController);
    }
    /**
     * Create authentication routes
     * @returns Express Router with auth routes
     */
    createAuthRoutes() {
        const router = express_1.default.Router();
        // Test route
        router.get("/test", (req, res) => {
            res.json({
                message: "Auth routes working with DI!",
                timestamp: new Date().toISOString(),
            });
        });
        // Authentication routes
        router.post("/login", (req, res, next) => this._authController.login(req, res, next));
        router.post("/register", (req, res, next) => this._authController.register(req, res, next));
        router.post("/register-manager", (req, res, next) => this._authController.registerManager(req, res, next));
        router.post("/logout", (req, res, next) => this._authController.logout(req, res, next));
        // Token management
        router.post("/refresh-token", (req, res, next) => this._authController.refreshToken(req, res, next));
        // Email verification
        router.post("/verify-email", (req, res, next) => this._authController.verifyEmail(req, res, next));
        // OTP routes
        router.post("/send-otp", (req, res, next) => this._authController.sendOtp(req, res, next));
        router.post("/verify-otp", (req, res, next) => this._authController.verifyOtp(req, res, next));
        // Password reset
        router.post("/reset-password-request", (req, res, next) => this._authController.resetPasswordReq(req, res, next));
        router.post("/reset-password", (req, res, next) => this._authController.resetPassword(req, res, next));
        // Signup completion
        router.post("/complete-signup", (req, res, next) => this._authController.completeSignup(req, res, next));
        // Invitation handling
        router.post("/accept-invite", (req, res, next) => this._authController.acceptInvite(req, res, next));
        router.get("/validate-invite/:token", (req, res, next) => this._authController.validateInviteToken(req, res, next));
        // Member invitation (might move to organization routes)
        router.post("/invite-member", (req, res, next) => this._authController.inviteMember(req, res, next));
        return router;
    }
    /**
     * Create manager routes (protected: ORG_MANAGER)
     */
    createManagerRoutes() {
        const router = express_1.default.Router();
        // Guard all routes
        router.use(AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(UserRole_1.UserRole.ORG_MANAGER));
        // Members
        router.get("/members", (req, res) => this._managerController.listMembers(req, res));
        // router.get("/members/:id", (req, res) =>
        //   this._managerController.getMemberById(req as AuthenticatedRequest, res),
        // );
        router.put("/members/:id/status", (req, res) => this._managerController.updateMemberStatus(req, res));
        router.delete("/members/:id", (req, res) => this._managerController.removeMember(req, res));
        // Invitations
        router.post("/invite", (req, res) => this._managerController.inviteMember(req, res));
        router.post("/bulk-invite", (req, res) => this._managerController.bulkInvite(req, res));
        router.get("/invitations", (req, res) => this._managerController.listInvitations(req, res));
        router.delete("/invitations/:token", (req, res) => this._managerController.cancelInvitation(req, res));
        return router;
    }
    /**
     * Create admin routes
     * @returns Express Router with admin routes
     */
    createAdminRoutes() {
        const router = express_1.default.Router();
        // Test route
        router.get("/test", (req, res) => {
            res.json({
                message: "Admin routes working with DI!",
                timestamp: new Date().toISOString(),
            });
        });
        // Protect all admin routes with auth + SUPER_ADMIN role
        router.use(AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(UserRole_1.UserRole.SUPER_ADMIN));
        // Organization management
        router.get("/organizations", (req, res) => this._adminController.listOrganizations(req, res));
        router.post("/organizations", (req, res) => this._adminController.createOrganization(req, res));
        router.get("/organizations/:id", (req, res) => this._adminController.getOrganizationById(req, res));
        router.put("/organizations/:id", (req, res) => this._adminController.updateOrganization(req, res));
        router.delete("/organizations/:id", (req, res) => this._adminController.deleteOrganization(req, res));
        // User management
        router.get("/users", (req, res) => this._adminController.listUsers(req, res));
        router.get("/users/:id", (req, res) => this._adminController.getUserById(req, res));
        router.put("/users/:id", (req, res) => this._adminController.updateUser(req, res));
        router.put("/users/:id/status", (req, res) => this._adminController.updateUserStatus(req, res));
        router.delete("/users/:id", (req, res) => this._adminController.deleteUser(req, res));
        // Organization user management
        router.get("/organizations/:orgId/users", (req, res) => this._adminController.getUsersByOrganization(req, res));
        // Member invitations
        router.post("/invite-member", (req, res) => this._adminController.inviteMember(req, res));
        router.post("/bulk-invite", (req, res) => this._adminController.bulkInviteMembers(req, res));
        // Reports and statistics
        router.get("/reports", (req, res) => this._adminController.getReports(req, res));
        router.get("/dashboard-stats", (req, res) => this._adminController.getDashboardStats(req, res));
        return router;
    }
    /**
     * Create organization routes (for regular users)
     * @returns Express Router with organization routes
     */
    createOrganizationRoutes() {
        const router = express_1.default.Router();
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
    createProjectRoutes() {
        const router = express_1.default.Router();
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
    createUserRoutes() {
        const router = express_1.default.Router();
        // Protect all user routes with auth
        router.use(AuthMiddleware_1.authMiddleware);
        // User profile management
        router.get("/profile", (req, res) => this._userController.getProfile(req, res));
        router.put("/profile", (req, res) => this._userController.updateProfile(req, res));
        router.post("/change-password", (req, res) => this._userController.changePassword(req, res));
        router.delete("/account", (req, res) => this._userController.deleteAccount(req, res));
        return router;
    }
    /**
     * Create all routes and return them as an object
     * @returns Object containing all route routers
     */
    createAllRoutes() {
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
exports.RouteFactory = RouteFactory;
/**
 * Factory function to create routes with dependency injection
 * @returns Object containing all route routers
 */
function createRoutes() {
    const routeFactory = new RouteFactory();
    return routeFactory.createAllRoutes();
}
//# sourceMappingURL=index.js.map