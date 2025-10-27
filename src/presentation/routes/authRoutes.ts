import express from "express";
import { AuthController } from "../controllers/AuthController";
import { UserRepo } from "../../infrastructure/repositories/UserRepo";
import { OtpService } from "../../infrastructure/services/OTPService";
import { EmailService } from "../../infrastructure/services/EmailService";
import { InviteRepo } from "../../infrastructure/repositories/InviteRepo";
import { RegisterManagerUseCase } from "../../application/useCase/RegisterManagerUseCase";
import { SendOtpUseCase } from "../../application/useCase/SendOtpUseCase";
import { VerifyOtpUseCase } from "../../application/useCase/VerifyOtpUseCase";
import { CompleteSignupUseCase } from "../../application/useCase/CompleteSignupUseCase";
import { InviteMemberUseCase } from "../../application/useCase/InviteMemberUseCase";
import { AcceptUseCase } from "../../application/useCase/AcceptUseCase";
import { AuthUseCases } from "../../application/useCase/AuthUseCase";
import { authMiddleware } from "../middleware/AuthMiddleware";
import { AUTH_ROUTES } from "./constants";
import { HashService } from "../../infrastructure/services/HashService";
import { Logger } from "../../infrastructure/services/Logger";
import { JwtService } from "../../infrastructure/services/JwtService";
import { ResetPasswordUseCase } from "../../application/useCase/ResetPasswordUseCase";
import { OrgRepo } from "../../infrastructure/repositories/OrgRepo";
import { JsonWebTokenProvider } from "../../infrastructure/services/providers/JsonWebTokenProvider";
import { RedisCacheService } from "../../infrastructure/services/RedisCacheService";

const userRepo = new UserRepo();
const orgRepo = new OrgRepo();
const otpService = new OtpService();
const emailService = new EmailService();
const cache = new RedisCacheService();
const inviteRepo = new InviteRepo();
const hashService = new HashService();
const jwtProvider = new JsonWebTokenProvider();
const jwtService = new JwtService(jwtProvider);
const logger = new Logger();
const resetPassword = new ResetPasswordUseCase(
  userRepo,
  hashService,
  jwtService,
  emailService,
  logger,
);
const authUseCase = new AuthUseCases(
  userRepo,
  hashService,
  jwtService,
  resetPassword,
  logger,
);

const registerManagerUC = new RegisterManagerUseCase(
  userRepo,
  otpService,
  emailService,
  logger,
  orgRepo,
);
const sendOtpUC = new SendOtpUseCase(
  userRepo,
  otpService,
  emailService,
  logger,
  cache,
);
const verifyOtpUC = new VerifyOtpUseCase(userRepo, logger, cache);
const completeSignupUC = new CompleteSignupUseCase(
  userRepo,
  logger,
  hashService,
  jwtService,
);
const inviteMemberUC = new InviteMemberUseCase(
  inviteRepo,
  emailService,
  logger,
  orgRepo,
  userRepo,
);
const acceptUC = new AcceptUseCase(
  inviteRepo,
  userRepo,
  logger,
  hashService,
  jwtService,
);

const authController = new AuthController(
  authUseCase,
  registerManagerUC,
  sendOtpUC,
  verifyOtpUC,
  completeSignupUC,
  acceptUC,
  inviteMemberUC,
  logger,
);

const router = express.Router();

// ✅ All routes now using correct AUTH_ROUTES constants
router.post(AUTH_ROUTES.LOGIN, (req, res) => authController.login(req, res));
router.post(AUTH_ROUTES.REFRESH, (req, res) =>
  authController.refreshToken(req, res),
);
router.post(AUTH_ROUTES.RESET_PASSWORD_REQUEST, (req, res) =>
  authController.resetPasswordReq(req, res),
);
router.post(AUTH_ROUTES.RESET_PASSWORD, (req, res) =>
  authController.resetPassword(req, res),
);
router.post(AUTH_ROUTES.VERIFY_EMAIL, authMiddleware, (req, res) =>
  authController.verifyEmail(req, res),
);

router.post(AUTH_ROUTES.REGISTER_MANAGER, (req, res) =>
  authController.registerManager(req, res),
);
router.post(AUTH_ROUTES.SEND_OTP, (req, res) =>
  authController.sendOtp(req, res),
);
router.post(AUTH_ROUTES.VERIFY_OTP, (req, res) =>
  authController.verifyOtp(req, res),
);
router.post(AUTH_ROUTES.COMPLETE_SIGNUP, (req, res) =>
  authController.completeSignup(req, res),
);

// ✅ FIXED: Use correct method name instead of authController(req, res)
router.post(AUTH_ROUTES.INVITE_MEMBER, (req, res) =>
  authController.inviteMember(req, res),
);

router.post(AUTH_ROUTES.ACCEPT_INVITE, (req, res) =>
  authController.acceptInvite(req, res),
);

export default router;
