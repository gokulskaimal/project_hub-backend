"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoutes = createRoutes;
const express_1 = __importDefault(require("express"));
const authRoutes_1 = require("./authRoutes");
const adminRoutes_1 = require("./adminRoutes");
const managerRoutes_1 = require("./managerRoutes");
const userRoutes_1 = require("./userRoutes");
function createRoutes(container) {
    // 1. Auth Routes
    const authRouter = (0, authRoutes_1.createAuthRoutes)(container);
    // 2. Admin Routes
    const adminRouter = (0, adminRoutes_1.createAdminRoutes)(container);
    // 3. Manager Routes
    const managerRouter = (0, managerRoutes_1.createManagerRoutes)(container);
    // 4. User Routes
    const userRouter = (0, userRoutes_1.createUserRoutes)(container);
    // 5. Placeholders (Strictly Typed)
    const orgRouter = express_1.default.Router();
    orgRouter.get("/", (_req, res) => {
        res.json({ message: "Coming soon" });
    });
    const projectRouter = express_1.default.Router();
    projectRouter.get("/", (_req, res) => {
        res.json({ message: "Coming soon" });
    });
    return {
        auth: authRouter,
        admin: adminRouter,
        manager: managerRouter,
        user: userRouter,
        organizations: orgRouter,
        projects: projectRouter,
    };
}
//# sourceMappingURL=index.js.map