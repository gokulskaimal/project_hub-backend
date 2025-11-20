"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const statusCodes_enum_1 = require("../../infrastructure/config/statusCodes.enum");
const common_constants_1 = require("../../infrastructure/config/common.constants");
const UserModel_1 = __importDefault(require("../../infrastructure/models/UserModel"));
const OrgModel_1 = __importDefault(require("../../infrastructure/models/OrgModel"));
const Organization_1 = require("../../domain/entities/Organization");
const UserRole_1 = require("../../domain/enums/UserRole");
async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];
    if (!token) {
        res
            .status(statusCodes_enum_1.StatusCodes.UNAUTHORIZED)
            .json({ error: common_constants_1.COMMON_MESSAGES.UNAUTHORIZED });
        return;
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
        // Allow super-admin tokens (synthetic user) to bypass DB checks
        if (payload.role !== UserRole_1.UserRole.SUPER_ADMIN) {
            // Fetch latest user state from DB to ensure status/org checks
            const userDoc = await UserModel_1.default.findById(payload.id);
            if (!userDoc) {
                res.status(statusCodes_enum_1.StatusCodes.UNAUTHORIZED).json({ error: common_constants_1.COMMON_MESSAGES.UNAUTHORIZED });
                return;
            }
            // If user is not ACTIVE, deny access
            if (userDoc.status !== "ACTIVE") {
                res.status(statusCodes_enum_1.StatusCodes.FORBIDDEN).json({ error: "User account suspended or disabled" });
                return;
            }
            // If user's organization exists and is not ACTIVE, deny access
            if (userDoc.orgId) {
                const orgDoc = await OrgModel_1.default.findById(userDoc.orgId);
                if (!orgDoc) {
                    res.status(statusCodes_enum_1.StatusCodes.FORBIDDEN).json({ error: "Organization not found" });
                    return;
                }
                if (orgDoc.status !== Organization_1.OrganizationStatus.ACTIVE) {
                    res.status(statusCodes_enum_1.StatusCodes.FORBIDDEN).json({ error: "Organization suspended or disabled" });
                    return;
                }
            }
        }
        req.user = payload;
        next();
    }
    catch (error) {
        // Check if the error is a JWT expiration error
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(statusCodes_enum_1.StatusCodes.UNAUTHORIZED).json({
                error: "JWT token expired",
                code: "TOKEN_EXPIRED"
            });
            return;
        }
        const message = error instanceof Error ? error.message : common_constants_1.COMMON_MESSAGES.UNAUTHORIZED;
        res.status(statusCodes_enum_1.StatusCodes.UNAUTHORIZED).json({ error: message });
    }
}
//# sourceMappingURL=AuthMiddleware.js.map