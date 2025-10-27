"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteFactory = void 0;
exports.createRoutes = createRoutes;
// src/presentation/routes/RouteFactory.ts
const express_1 = __importDefault(require("express"));
const Container_1 = require("../../infrastructure/container/Container");
const types_1 = require("../../infrastructure/container/types");
/**
 * Route Factory using Dependency Injection
 *
 * This factory creates Express routers with controllers resolved from the DI container.
 * It ensures proper dependency injection throughout the application.
 */
class RouteFactory {
    constructor() {
        // Resolve controllers from DI container
        this._authController = Container_1.diContainer.get(types_1.TYPES.AuthController);
        this._adminController = Container_1.diContainer.get(types_1.TYPES.AdminController);
    }
    /**
     * Create authentication routes
     * @returns Express Router with auth routes
     */
    createAuthRoutes() {
        const router = express_1.default.Router();
        // Test route
        router.get('/test', (req, res) => {
            res.json({
                message: 'Auth routes working with DI!',
                timestamp: new Date().toISOString()
            });
        });
        // Authentication routes
        router.post('/login', (req, res) => this._authController.login(req, res));
        router.post('/register', (req, res) => this._authController.register(req, res));
        router.post('/register-manager', (req, res) => this._authController.registerManager(req, res));
        router.post('/logout', (req, res) => this._authController.logout(req, res));
        // Token management
        router.post('/refresh-token', (req, res) => this._authController.refreshToken(req, res));
        // Email verification
        router.post('/verify-email', (req, res) => this._authController.verifyEmail(req, res));
        // OTP routes
        router.post('/send-otp', (req, res) => this._authController.sendOtp(req, res));
        router.post('/verify-otp', (req, res) => this._authController.verifyOtp(req, res));
        // Password reset
        router.post('/reset-password-request', (req, res) => this._authController.resetPasswordReq(req, res));
        router.post('/reset-password', (req, res) => this._authController.resetPassword(req, res));
        // Signup completion
        router.post('/complete-signup', (req, res) => this._authController.completeSignup(req, res));
        // Invitation handling
        router.post('/accept-invite', (req, res) => this._authController.acceptInvite(req, res));
        router.get('/validate-invite/:token', (req, res) => this._authController.validateInviteToken(req, res));
        // Member invitation (might move to organization routes)
        router.post('/invite-member', (req, res) => this._authController.inviteMember(req, res));
        return router;
    }
    /**
     * Create admin routes
     * @returns Express Router with admin routes
     */
    createAdminRoutes() {
        const router = express_1.default.Router();
        // Test route
        router.get('/test', (req, res) => {
            res.json({
                message: 'Admin routes working with DI!',
                timestamp: new Date().toISOString()
            });
        });
        // Organization management
        router.get('/organizations', (req, res) => this._adminController.listOrganizations(req, res));
        router.post('/organizations', (req, res) => this._adminController.createOrganization(req, res));
        router.get('/organizations/:id', (req, res) => this._adminController.getOrganizationById(req, res));
        router.put('/organizations/:id', (req, res) => this._adminController.updateOrganization(req, res));
        router.delete('/organizations/:id', (req, res) => this._adminController.deleteOrganization(req, res));
        // User management
        router.get('/users', (req, res) => this._adminController.listUsers(req, res));
        router.get('/users/:id', (req, res) => this._adminController.getUserById(req, res));
        router.put('/users/:id', (req, res) => this._adminController.updateUser(req, res));
        router.put('/users/:id/status', (req, res) => this._adminController.updateUserStatus(req, res));
        router.delete('/users/:id', (req, res) => this._adminController.deleteUser(req, res));
        // Organization user management
        router.get('/organizations/:orgId/users', (req, res) => this._adminController.getUsersByOrganization(req, res));
        // Member invitations
        router.post('/invite-member', (req, res) => this._adminController.inviteMember(req, res));
        router.post('/bulk-invite', (req, res) => this._adminController.bulkInviteMembers(req, res));
        // Reports and statistics
        router.get('/reports', (req, res) => this._adminController.getReports(req, res));
        router.get('/dashboard-stats', (req, res) => this._adminController.getDashboardStats(req, res));
        return router;
    }
    /**
     * Create organization routes (for regular users)
     * @returns Express Router with organization routes
     */
    createOrganizationRoutes() {
        const router = express_1.default.Router();
        // Basic organization operations
        router.get('/', (req, res) => {
            // TODO: This should use OrganizationController when created
            res.json({
                message: 'Organization routes - coming soon!',
                timestamp: new Date().toISOString()
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
        router.get('/', (req, res) => {
            // TODO: This should use ProjectController when created
            res.json({
                message: 'Project routes - coming soon!',
                timestamp: new Date().toISOString()
            });
        });
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
            projects: this.createProjectRoutes()
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