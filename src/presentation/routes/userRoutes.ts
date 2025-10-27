import express from "express";
import { UserController } from "../controllers/UserController";
import { UserRepo } from "../../infrastructure/repositories/UserRepo";
import { UserProfileUseCase } from "../../application/useCase/UserProfileUseCase";
import { authMiddleware } from "../middleware/AuthMiddleware";
import { USER_ROUTES } from "./constants";
import { HashService } from "../../infrastructure/services/HashService";
import { Logger } from "../../infrastructure/services/Logger";

const router = express.Router();

const userRepo = new UserRepo();
const hashService = new HashService();
const logger = new Logger();
const userProfileUseCase = new UserProfileUseCase(
  userRepo,
  hashService,
  logger,
);

const userController = new UserController(logger, userProfileUseCase);

router.get(USER_ROUTES.PROFILE, authMiddleware, (req, res) =>
  userController.getProfile(req, res),
);
router.put(USER_ROUTES.PROFILE, authMiddleware, (req, res) =>
  userController.updateProfile(req, res),
);

export default router;
