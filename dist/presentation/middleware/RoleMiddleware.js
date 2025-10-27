"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = roleMiddleware;
function roleMiddleware(requiredRoles) {
    return (req, res, next) => {
        const currentUser = req.user;
        if (!currentUser) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        const allowedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        if (!allowedRoles.includes(currentUser.role)) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        next();
    };
}
//# sourceMappingURL=RoleMiddleware.js.map