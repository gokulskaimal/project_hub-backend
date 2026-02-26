"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserRoutes = createUserRoutes;
const express_1 = require("express");
const types_1 = require("../../infrastructure/container/types");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const apiRoutes_constant_1 = require("../../infrastructure/config/apiRoutes.constant");
function createUserRoutes(container) {
    const router = (0, express_1.Router)();
    const controller = container.get(types_1.TYPES.UserController);
    router.use(apiRoutes_constant_1.API_ROUTES.USER.BASE, AuthMiddleware_1.authMiddleware);
    router.get(apiRoutes_constant_1.API_ROUTES.USER.PROFILE, (req, res, next) => controller.getProfile(req, res, next));
    router.put(apiRoutes_constant_1.API_ROUTES.USER.PROFILE, (req, res, next) => controller.updateProfile(req, res, next));
    router.post(apiRoutes_constant_1.API_ROUTES.USER.CHANGE_PASSWORD, (req, res, next) => controller.changePassword(req, res, next));
    router.delete(apiRoutes_constant_1.API_ROUTES.USER.DELETE_ACCOUNT, (req, res, next) => controller.deleteAccount(req, res, next));
    return router;
}
//# sourceMappingURL=userRoutes.js.map