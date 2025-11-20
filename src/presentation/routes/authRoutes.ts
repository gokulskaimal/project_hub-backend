import express from "express";
import { Request, Response, NextFunction } from "express";
import { UserRepo } from "../../infrastructure/repositories/UserRepo";
import { OrgRepo } from "../../infrastructure/repositories/OrgRepo";
import { InviteRepo } from "../../infrastructure/repositories/InviteRepo";
import { OtpService } from "../../infrastructure/services/OTPService";
import { EmailService } from "../../infrastructure/services/EmailService";
import { HashService } from "../../infrastructure/services/HashService";
import { Logger } from "../../infrastructure/services/Logger";
import { JsonWebTokenProvider } from "../../infrastructure/services/providers/JsonWebTokenProvider";
import { JwtService } from "../../infrastructure/services/JwtService";
import { RedisCacheService } from "../../infrastructure/services/RedisCacheService";

import { RegisterManagerUseCase } from "../../application/useCase/RegisterManagerUseCase";
import { SendOtpUseCase } from "../../application/useCase/SendOtpUseCase";
import { VerifyOtpUseCase } from "../../application/useCase/VerifyOtpUseCase";
import { CompleteSignupUseCase } from "../../application/useCase/CompleteSignupUseCase";
import { InviteMemberUseCase } from "../../application/useCase/InviteMemberUseCase";
import { AcceptUseCase } from "../../application/useCase/AcceptUseCase";
import { AuthUseCases } from "../../application/useCase/AuthUseCase";
import { ResetPasswordUseCase } from "../../application/useCase/ResetPasswordUseCase";
import { GoogleAuthService } from "../../infrastructure/services/GoogleAuthService";

import { AUTH_ROUTES } from "./constants";
import { AuthController } from "../controllers/AuthController";
import { authMiddleware } from "../middleware/AuthMiddleware";

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
const googleAuthService = new GoogleAuthService();
const resetPasswordUC = new ResetPasswordUseCase(
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
  googleAuthService,
  resetPasswordUC,
  logger,
  orgRepo,
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
  logger,
  authUseCase,
  registerManagerUC,
  sendOtpUC,
  verifyOtpUC,
  completeSignupUC,
  inviteMemberUC,
  acceptUC,
  resetPasswordUC,
);

const router = express.Router();

//AUTH_ROUTES constants

router.post(
  AUTH_ROUTES.LOGIN,
  (req: Request, res: Response, next: NextFunction) =>
    authController.login(req, res, next),
);

router.post(AUTH_ROUTES.REFRESH, (req, res, next) =>
  authController.refreshToken(req, res, next),
);

router.post(
  AUTH_ROUTES.RESET_PASSWORD_REQUEST,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const result = await resetPasswordUC.requestReset(email);
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  },
);

router.post(
  AUTH_ROUTES.RESET_PASSWORD,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body;
      const result = await resetPasswordUC.resetWithToken(token, password);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  },
);
router.post(
  AUTH_ROUTES.VERIFY_EMAIL,
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.body?.token ?? req.headers["x-verification-token"];
      if (!token)
        return res.status(400).json({ error: "Verification token missing" });

      const result = await authUseCase.verifyEmail(token);
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  },
);

router.post(
  AUTH_ROUTES.REGISTER_MANAGER,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, organizationName } = req.body;
      const result = await registerManagerUC.execute(email, organizationName);
      return res.status(201).json(result);
    } catch (err) {
      return next(err);
    }
  },
);

router.post(
  AUTH_ROUTES.SEND_OTP,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const result = await sendOtpUC.execute(email);
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  },
);

router.post(
  AUTH_ROUTES.VERIFY_OTP,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, otp } = req.body;
      const result = await verifyOtpUC.execute(email, otp);
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  },
);

router.post(
  AUTH_ROUTES.COMPLETE_SIGNUP,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      const result = await completeSignupUC.execute(
        email,
        password,
        firstName,
        lastName,
      );
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  },
);

router.post(
  AUTH_ROUTES.INVITE_MEMBER,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, orgId, role } = req.body;
      const result = await inviteMemberUC.execute(email, orgId, role);
      return res.status(201).json(result);
    } catch (err) {
      return next(err);
    }
  },
);

router.post(
  AUTH_ROUTES.ACCEPT_INVITE,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password, firstName, lastName } = req.body;
      const result = await acceptUC.execute(
        token,
        password,
        firstName,
        lastName,
      );
      return res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  AUTH_ROUTES.GOOGLE_SIGNIN,
  (req: Request, res: Response, next: NextFunction) =>
    authController.googleSignIn(req, res, next),
);

export default router;
