"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdminRoutes = createAdminRoutes;
const express_1 = require("express");
const types_1 = require("../../infrastructure/container/types");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const RoleMiddleware_1 = require("../middleware/RoleMiddleware");
const UserRole_1 = require("../../domain/enums/UserRole");
const constants_1 = require("./constants");
function createAdminRoutes(container) {
    const router = (0, express_1.Router)();
    // Get new split controllers
    const userController = container.get(types_1.TYPES.AdminUserController);
    const orgController = container.get(types_1.TYPES.AdminOrgController);
    const planController = container.get(types_1.TYPES.AdminPlanController);
    // Protect all admin routes
    router.use("/admin", AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(UserRole_1.UserRole.SUPER_ADMIN));
    // ===== Organizations =====
    router.get(constants_1.API_ROUTES.ADMIN.ORGANIZATIONS, (req, res, next) => orgController.listOrganizations(req, res, next));
    router.post(constants_1.API_ROUTES.ADMIN.ORGANIZATIONS, (req, res, next) => orgController.createOrganization(req, res, next));
    router.get(`${constants_1.API_ROUTES.ADMIN.ORGANIZATIONS}/:id`, (req, res, next) => orgController.getOrganizationById(req, res, next));
    router.put(`${constants_1.API_ROUTES.ADMIN.ORGANIZATIONS}/:id`, (req, res, next) => orgController.updateOrganization(req, res, next));
    router.delete(`${constants_1.API_ROUTES.ADMIN.ORGANIZATIONS}/:id`, (req, res, next) => orgController.deleteOrganization(req, res, next));
    // ===== Users =====
    router.get(constants_1.API_ROUTES.ADMIN.USERS, (req, res, next) => userController.listUsers(req, res, next));
    router.get(`${constants_1.API_ROUTES.ADMIN.USERS}/:id`, (req, res, next) => userController.getUserById(req, res, next));
    router.delete(`${constants_1.API_ROUTES.ADMIN.USERS}/:id`, (req, res, next) => userController.deleteUser(req, res, next));
    router.put(`${constants_1.API_ROUTES.ADMIN.USERS}/:id`, (req, res, next) => userController.updateUser(req, res, next));
    router.put(`${constants_1.API_ROUTES.ADMIN.USERS}/:id/status`, (req, res, next) => userController.updateUserStatus(req, res, next));
    // ===== Specific actions (Org Related) =====
    router.get(constants_1.API_ROUTES.ADMIN.REPORTS, (req, res, next) => orgController.getReports(req, res, next));
    router.post("/invite-member", (req, res, next) => orgController.inviteMember(req, res, next));
    router.post("/bulk-invite", (req, res, next) => orgController.bulkInviteMembers(req, res, next));
    // ===== Plans =====
    router.post(constants_1.API_ROUTES.ADMIN.PLANS, (req, res, next) => planController.createPlan(req, res, next));
    router.get(constants_1.API_ROUTES.ADMIN.PLANS, (req, res, next) => planController.getPlans(req, res, next));
    router.put(`${constants_1.API_ROUTES.ADMIN.PLANS}/:id`, (req, res, next) => planController.updatePlan(req, res, next));
    router.delete(`${constants_1.API_ROUTES.ADMIN.PLANS}/:id`, (req, res, next) => planController.deletePlan(req, res, next));
    return router;
}
//# sourceMappingURL=adminRoutes.js.map