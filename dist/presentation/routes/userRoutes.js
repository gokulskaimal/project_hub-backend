"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = require("../controllers/UserController");
const UserRepo_1 = require("../../infrastructure/repositories/UserRepo");
const UserProfileUseCase_1 = require("../../application/useCase/UserProfileUseCase");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const constants_1 = require("./constants");
const HashService_1 = require("../../infrastructure/services/HashService");
const Logger_1 = require("../../infrastructure/services/Logger");
const router = express_1.default.Router();
const userRepo = new UserRepo_1.UserRepo();
const hashService = new HashService_1.HashService();
const logger = new Logger_1.Logger();
const userProfileUseCase = new UserProfileUseCase_1.UserProfileUseCase(userRepo, hashService, logger);
const userController = new UserController_1.UserController(logger, userProfileUseCase);
router.get(constants_1.USER_ROUTES.PROFILE, AuthMiddleware_1.authMiddleware, (req, res) => userController.getProfile(req, res));
router.put(constants_1.USER_ROUTES.PROFILE, AuthMiddleware_1.authMiddleware, (req, res) => userController.updateProfile(req, res));
exports.default = router;
//# sourceMappingURL=userRoutes.js.map