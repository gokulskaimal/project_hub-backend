"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserRoutes = createUserRoutes;
const express_1 = require("express");
const types_1 = require("../../infrastructure/container/types");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const constants_1 = require("./constants");
function createUserRoutes(container) {
    const router = (0, express_1.Router)();
    const controller = container.get(types_1.TYPES.UserController);
    // Protect all user routes
    router.use(AuthMiddleware_1.authMiddleware);
    router.get(constants_1.API_ROUTES.USER.PROFILE, (req, res, next) => {
        controller.getProfile(req, res, next);
    });
    router.put(constants_1.API_ROUTES.USER.PROFILE, (req, res, next) => controller.updateProfile(req, res, next));
    router.post(constants_1.API_ROUTES.USER.CHANGE_PASSWORD, (req, res, next) => controller.changePassword(req, res, next));
    router.delete("/account", (req, res, next) => controller.deleteAccount(req, res, next));
    return router;
}
//# sourceMappingURL=userRoutes.js.map