"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createManagerRoutes = createManagerRoutes;
const express_1 = require("express");
const types_1 = require("../../infrastructure/container/types");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const RoleMiddleware_1 = require("../middleware/RoleMiddleware");
const UserRole_1 = require("../../domain/enums/UserRole");
const constants_1 = require("./constants");
function createManagerRoutes(container) {
    const router = (0, express_1.Router)();
    const controller = container.get(types_1.TYPES.ManagerController);
    // Protect all manager routes
    router.use("/manager", AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(UserRole_1.UserRole.ORG_MANAGER));
    router.get(constants_1.API_ROUTES.MANAGER.MEMBERS, (req, res, next) => controller.listMembers(req, res, next));
    router.delete(`${constants_1.API_ROUTES.MANAGER.MEMBERS}/:id`, (req, res, next) => controller.removeMember(req, res, next));
    router.put(`${constants_1.API_ROUTES.MANAGER.MEMBERS}/:id/status`, (req, res, next) => controller.updateMemberStatus(req, res, next));
    router.post(constants_1.API_ROUTES.MANAGER.INVITE, (req, res, next) => controller.inviteMember(req, res, next));
    router.post(constants_1.API_ROUTES.MANAGER.BULK_INVITE, (req, res, next) => controller.bulkInvite(req, res, next));
    router.get(constants_1.API_ROUTES.MANAGER.INVITATIONS, (req, res, next) => controller.listInvitations(req, res, next));
    router.delete(`${constants_1.API_ROUTES.MANAGER.INVITATIONS}/:token`, (req, res, next) => controller.cancelInvitation(req, res, next));
    return router;
}
//# sourceMappingURL=managerRoutes.js.map