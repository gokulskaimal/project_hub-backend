"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoutes = createRoutes;
const express_1 = __importDefault(require("express"));
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const RoleMiddleware_1 = require("../middleware/RoleMiddleware");
const UserRole_1 = require("../../domain/enums/UserRole");
const constants_1 = require("./constants");
const types_1 = require("../../infrastructure/container/types");
const statusCodes_enum_1 = require("../../infrastructure/config/statusCodes.enum");
const common_constants_1 = require("../../infrastructure/config/common.constants");
/**
 * Create all application routes using Dependency Injection
 * @param container - Inversify DI container
 * @returns Express router with all routes
 */
function createRoutes(container) {
    const router = express_1.default.Router();
    // GET CONTROLLERS FROM DI CONTAINER (No more 'new' keyword!)
    const adminController = container.get(types_1.TYPES.AdminController);
    const managerController = container.get(types_1.TYPES.ManagerController);
    const userController = container.get(types_1.TYPES.UserController);
    const authController = container.get(types_1.TYPES.AuthController);
    // =================================================================
    // AUTHENTICATION ROUTES (Public)
    // =================================================================
    // POST /api/auth/login
    router.post(constants_1.API_ROUTES.AUTH.LOGIN, (req, res, next) => authController.login(req, res, next));
    // POST /api/auth/register
    router.post(constants_1.API_ROUTES.AUTH.REGISTER, (req, res, next) => authController.register(req, res, next));
    // POST /api/auth/verify-otp
    router.post(constants_1.API_ROUTES.AUTH.VERIFY_OTP, (req, res, next) => authController.verifyOtp(req, res, next));
    // POST /api/auth/reset-password
    router.post(constants_1.API_ROUTES.AUTH.RESET_PASSWORD, (req, res, next) => authController.resetPasswordReq(req, res, next));
    // POST /api/auth/complete-reset
    router.post(constants_1.API_ROUTES.AUTH.COMPLETE_RESET, (req, res) => res.status(501).json({
        message: "Endpoint not implemented",
    }));
    // POST /api/auth/refresh-token
    router.post("/auth/refresh-token", (req, res, next) => authController.refreshToken(req, res, next));
    // =================================================================
    // ADMIN ROUTES (Super Admin Only)
    // =================================================================
    // GET /api/admin/organizations
    router.get(constants_1.API_ROUTES.ADMIN.ORGANIZATIONS, AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(UserRole_1.UserRole.SUPER_ADMIN), (req, res) => adminController.listOrganizations(req, res));
    // POST /api/admin/organizations
    router.post(constants_1.API_ROUTES.ADMIN.ORGANIZATIONS, AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(UserRole_1.UserRole.SUPER_ADMIN), (req, res) => adminController.createOrganization(req, res));
    // PUT /api/admin/organizations/:id
    router.put(`${constants_1.API_ROUTES.ADMIN.ORGANIZATIONS}/:id`, AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(UserRole_1.UserRole.SUPER_ADMIN), (req, res) => adminController.updateOrganization(req, res));
    // DELETE /api/admin/organizations/:id
    router.delete(`${constants_1.API_ROUTES.ADMIN.ORGANIZATIONS}/:id`, AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(UserRole_1.UserRole.SUPER_ADMIN), (req, res) => adminController.deleteOrganization(req, res));
    // GET /api/admin/users
    router.get(constants_1.API_ROUTES.ADMIN.USERS, AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(UserRole_1.UserRole.SUPER_ADMIN), (req, res) => adminController.listUsers(req, res));
    // GET /api/admin/reports
    router.get(constants_1.API_ROUTES.ADMIN.REPORTS, AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(UserRole_1.UserRole.SUPER_ADMIN), (req, res) => adminController.getReports(req, res));
    // =================================================================
    // MANAGER ROUTES (Organization Manager Only)
    // =================================================================
    // POST /api/manager/invite
    router.post(constants_1.API_ROUTES.MANAGER.INVITE, AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(UserRole_1.UserRole.ORG_MANAGER), (req, res) => managerController.inviteMember(req, res));
    // POST /api/manager/bulk-invite
    router.post(constants_1.API_ROUTES.MANAGER.BULK_INVITE, AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(UserRole_1.UserRole.ORG_MANAGER), (req, res) => managerController.bulkInvite(req, res));
    // GET /api/manager/members
    router.get(constants_1.API_ROUTES.MANAGER.MEMBERS, AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(UserRole_1.UserRole.ORG_MANAGER), (req, res) => managerController.listMembers(req, res));
    // DELETE /api/manager/members/:id
    router.delete(`${constants_1.API_ROUTES.MANAGER.MEMBERS}/:id`, AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(UserRole_1.UserRole.ORG_MANAGER), (req, res) => managerController.removeMember(req, res));
    // GET /api/manager/activity
    // router.get(
    //     API_ROUTES.MANAGER.ACTIVITY,
    //     authMiddleware,
    //     roleMiddleware(UserRole.ORG_MANAGER),
    //     (req, res) => managerController.getActivity(req, res)
    // );
    // GET /api/manager/invitations
    router.get("/manager/invitations", AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(UserRole_1.UserRole.ORG_MANAGER), (req, res) => managerController.listInvitations(req, res));
    // DELETE /api/manager/invitations/:token
    router.delete("/manager/invitations/:token", AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(UserRole_1.UserRole.ORG_MANAGER), (req, res) => managerController.cancelInvitation(req, res));
    // =================================================================
    // USER ROUTES (Authenticated Users)
    // =================================================================
    // GET /api/user/profile
    router.get(constants_1.API_ROUTES.USER.PROFILE, AuthMiddleware_1.authMiddleware, (req, res) => userController.getProfile(req, res));
    // PUT /api/user/profile
    router.put(constants_1.API_ROUTES.USER.PROFILE, AuthMiddleware_1.authMiddleware, (req, res) => userController.updateProfile(req, res));
    // POST /api/user/change-password
    router.post(constants_1.API_ROUTES.USER.CHANGE_PASSWORD, AuthMiddleware_1.authMiddleware, (req, res) => userController.changePassword(req, res));
    // GET /api/user/activity
    // router.get(
    //     '/user/activity',
    //     authMiddleware,
    //     (req, res) => userController.getActivityHistory(req, res)
    // );
    // DELETE /api/user/account
    router.delete("/user/account", AuthMiddleware_1.authMiddleware, (req, res) => userController.deleteAccount(req, res));
    // =================================================================
    // PUBLIC ROUTES
    // =================================================================
    // GET /api/health - Health check endpoint
    // router.get("/health", (req, res) => {
    //   res.status(StatusCodes.OK).json({
    //     status: "healthy",
    //     timestamp: new Date().toISOString(),
    //     version: process.env.APP_VERSION || "1.0.0",
    //     environment: process.env.NODE_ENV || "development",
    //   });
    // });
    // GET /api/invite/:token - Public invitation acceptance page
    router.get("/invite/:token", (req, res, next) => authController.validateInviteToken(req, res, next));
    // POST /api/invite/:token/accept - Accept invitation
    router.post("/invite/:token/accept", (req, res, next) => authController.acceptInvite(req, res, next));
    // =================================================================
    // ERROR HANDLING & 404
    // =================================================================
    // Handle 404 for API routes
    router.use("*", (req, res) => {
        res.status(statusCodes_enum_1.StatusCodes.NOT_FOUND).json({
            success: false,
            error: common_constants_1.COMMON_MESSAGES.NOT_FOUND,
            path: req.originalUrl,
            method: req.method,
            timestamp: new Date().toISOString(),
        });
    });
    return router;
}
// Export default router factory function
exports.default = createRoutes;
//# sourceMappingURL=adminRoutes.js.map