"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = roleMiddleware;
const statusCodes_enum_1 = require("../../infrastructure/config/statusCodes.enum");
const common_constants_1 = require("../../infrastructure/config/common.constants");
function roleMiddleware(requiredRoles) {
    return (req, res, next) => {
        const currentUser = req.user;
        if (!currentUser) {
            res
                .status(statusCodes_enum_1.StatusCodes.FORBIDDEN)
                .json({ error: common_constants_1.COMMON_MESSAGES.FORBIDDEN });
            return;
        }
        const allowedRoles = Array.isArray(requiredRoles)
            ? requiredRoles
            : [requiredRoles];
        if (!allowedRoles.includes(currentUser.role)) {
            res
                .status(statusCodes_enum_1.StatusCodes.FORBIDDEN)
                .json({ error: common_constants_1.COMMON_MESSAGES.FORBIDDEN });
            return;
        }
        next();
    };
}
//# sourceMappingURL=RoleMiddleware.js.map