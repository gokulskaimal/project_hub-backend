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
    const controller = container.get(types_1.TYPES.AdminController);
    // Protect all admin routes
    router.use("/admin", AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(UserRole_1.UserRole.SUPER_ADMIN));
    // Organizations
    router.get(constants_1.API_ROUTES.ADMIN.ORGANIZATIONS, (req, res, next) => controller.listOrganizations(req, res, next));
    router.post(constants_1.API_ROUTES.ADMIN.ORGANIZATIONS, (req, res, next) => controller.createOrganization(req, res, next));
    router.put(`${constants_1.API_ROUTES.ADMIN.ORGANIZATIONS}/:id`, (req, res, next) => controller.updateOrganization(req, res, next));
    router.delete(`${constants_1.API_ROUTES.ADMIN.ORGANIZATIONS}/:id`, (req, res, next) => controller.deleteOrganization(req, res, next));
    // Users
    router.get(constants_1.API_ROUTES.ADMIN.USERS, (req, res, next) => controller.listUsers(req, res, next));
    router.delete(`${constants_1.API_ROUTES.ADMIN.USERS}/:id`, (req, res, next) => controller.deleteUser(req, res, next));
    router.put(`${constants_1.API_ROUTES.ADMIN.USERS}/:id/status`, (req, res, next) => controller.updateUserStatus(req, res, next));
    // Specific actions
    router.get(constants_1.API_ROUTES.ADMIN.REPORTS, (req, res, next) => controller.getReports(req, res, next));
    router.post("/invite-member", (req, res, next) => controller.inviteMember(req, res, next));
    router.post("/bulk-invite", (req, res, next) => controller.bulkInviteMembers(req, res, next));
    //Plans
    //Plans
    router.post(constants_1.API_ROUTES.ADMIN.PLANS, (req, res, next) => controller.createPlan(req, res, next));
    router.get(constants_1.API_ROUTES.ADMIN.PLANS, (req, res, next) => controller.getPlans(req, res, next));
    router.put(`${constants_1.API_ROUTES.ADMIN.PLANS}/:id`, (req, res, next) => controller.updatePlan(req, res, next));
    router.delete(`${constants_1.API_ROUTES.ADMIN.PLANS}/:id`, (req, res, next) => controller.deletePlan(req, res, next));
    return router;
}
//# sourceMappingURL=adminRoutes.js.map