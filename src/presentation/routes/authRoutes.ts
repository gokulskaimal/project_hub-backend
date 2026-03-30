import { Router } from "express";
import { Container } from "inversify";
import { SessionController } from "../controllers/auth/SessionController";
import { RegistrationController } from "../controllers/auth/RegistrationController";
import { InviteController } from "../controllers/auth/InviteController";
import { PasswordController } from "../controllers/auth/PasswordController";
import { TYPES } from "../../infrastructure/container/types";
import { validate } from "../middleware/ValidationMiddleware";
import { API_ROUTES } from "../../infrastructure/config/apiRoutes.constant"; // Update import path

// Import Schemas
import {
  loginSchema,
  registerSchema,
  sendOtpSchema,
  verifyOtpSchema,
  completeSignupSchema,
} from "../validation/authSchemas";

export function createAuthRoutes(container: Container): Router {
  const router = Router();

  const sessionCtrl = container.get<SessionController>(TYPES.SessionController);
  const regCtrl = container.get<RegistrationController>(
    TYPES.RegistrationController,
  );
  const inviteCtrl = container.get<InviteController>(TYPES.InviteController);
  const pwdCtrl = container.get<PasswordController>(TYPES.PasswordController);

  router.post(API_ROUTES.AUTH.LOGIN, validate(loginSchema), (req, res, next) =>
    sessionCtrl.login(req, res, next),
  );
  router.post(
    API_ROUTES.AUTH.REGISTER,
    validate(registerSchema),
    (req, res, next) => regCtrl.register(req, res, next),
  );
  router.post(
    API_ROUTES.AUTH.SIGNUP_MANAGER,
    validate(registerSchema),
    (req, res, next) => regCtrl.registerManager(req, res, next),
  );

  router.post(
    API_ROUTES.AUTH.SEND_OTP,
    validate(sendOtpSchema),
    (req, res, next) => regCtrl.sendOtp(req, res, next),
  );
  router.post(
    API_ROUTES.AUTH.VERIFY_OTP,
    validate(verifyOtpSchema),
    (req, res, next) => regCtrl.verifyOtp(req, res, next),
  );
  router.post(API_ROUTES.AUTH.VERIFY_EMAIL, (req, res, next) =>
    regCtrl.verifyEmail(req, res, next),
  );

  router.post(
    API_ROUTES.AUTH.COMPLETE_SIGNUP,
    validate(completeSignupSchema),
    (req, res, next) => regCtrl.completeSignup(req, res, next),
  );

  router.post(API_ROUTES.AUTH.RESET_PASSWORD_REQUEST, (req, res, next) =>
    pwdCtrl.resetPasswordReq(req, res, next),
  );
  router.post(API_ROUTES.AUTH.RESET_PASSWORD, (req, res, next) =>
    pwdCtrl.resetPassword(req, res, next),
  );

  router.post(API_ROUTES.AUTH.ACCEPT_INVITE, (req, res, next) =>
    inviteCtrl.acceptInvite(req, res, next),
  );
  router.get(API_ROUTES.AUTH.VALIDATE_INVITE(":token"), (req, res, next) =>
    inviteCtrl.validateInviteToken(req, res, next),
  );

  router.post(API_ROUTES.AUTH.GOOGLE_SIGNIN, (req, res, next) =>
    sessionCtrl.googleSignIn(req, res, next),
  );
  router.post(API_ROUTES.AUTH.REFRESH, (req, res, next) =>
    sessionCtrl.refreshToken(req, res, next),
  );
  router.post(API_ROUTES.AUTH.LOGOUT, (req, res, next) =>
    sessionCtrl.logout(req, res, next),
  );

  return router;
}
