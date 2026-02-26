"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createManagerRoutes = createManagerRoutes;
const express_1 = require("express");
const types_1 = require("../../infrastructure/container/types");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const RoleMiddleware_1 = require("../middleware/RoleMiddleware");
const UserRole_1 = require("../../domain/enums/UserRole");
const apiRoutes_constant_1 = require("../../infrastructure/config/apiRoutes.constant");
function createManagerRoutes(container) {
    const router = (0, express_1.Router)();
    const controller = container.get(types_1.TYPES.ManagerController);
    router.use(apiRoutes_constant_1.API_ROUTES.MANAGER.BASE, AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(UserRole_1.UserRole.ORG_MANAGER));
    router.get(apiRoutes_constant_1.API_ROUTES.MANAGER.MEMBERS, (req, res, next) => controller.listMembers(req, res, next));
    router.delete(`${apiRoutes_constant_1.API_ROUTES.MANAGER.MEMBERS}/:id`, (req, res, next) => controller.removeMember(req, res, next));
    router.put(`${apiRoutes_constant_1.API_ROUTES.MANAGER.MEMBERS}/:id/status`, (req, res, next) => controller.updateMemberStatus(req, res, next));
    router.post(apiRoutes_constant_1.API_ROUTES.MANAGER.INVITE, (req, res, next) => controller.inviteMember(req, res, next));
    router.post(apiRoutes_constant_1.API_ROUTES.MANAGER.BULK_INVITE, (req, res, next) => controller.bulkInvite(req, res, next));
    router.get(apiRoutes_constant_1.API_ROUTES.MANAGER.INVITATIONS, (req, res, next) => controller.listInvitations(req, res, next));
    router.delete(`${apiRoutes_constant_1.API_ROUTES.MANAGER.INVITATIONS}/:id`, (req, res, next) => controller.cancelInvitation(req, res, next));
    router.get(apiRoutes_constant_1.API_ROUTES.MANAGER.ORGANIZATION, (req, res, next) => controller.getOrganization(req, res, next));
    // Note: TaskController is not directly instantiated here, but checking for project task routes
    // The actual routes for tasks are under projectRoutes.ts
    return router;
}
//# sourceMappingURL=managerRoutes.js.map