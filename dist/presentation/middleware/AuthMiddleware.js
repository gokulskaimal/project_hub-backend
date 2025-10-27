"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = payload;
        next();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unauthorized';
        res.status(401).json({ error: message });
    }
}
//# sourceMappingURL=AuthMiddleware.js.map