import { Router } from "express";
import { Container } from "inversify";
import { SessionController } from "../controllers/auth/SessionController";
import { RegistrationController } from "../controllers/auth/RegistrationController";
import { InviteController } from "../controllers/auth/InviteController";
import { PasswordController } from "../controllers/auth/PasswordController";
import { TYPES } from "../../infrastructure/container/types";
import { validate } from "../middleware/ValidationMiddleware";
import { API_ROUTES } from "./constants";

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
  
  // Resolve controllers from the DI container
  const sessionCtrl = container.get<SessionController>(TYPES.SessionController);
  const regCtrl = container.get<RegistrationController>(TYPES.RegistrationController);
  const inviteCtrl = container.get<InviteController>(TYPES.InviteController);
  const pwdCtrl = container.get<PasswordController>(TYPES.PasswordController);

  // --- Session & standard Auth ---

  // POST /auth/login
  router.post(API_ROUTES.AUTH.LOGIN, validate(loginSchema), (req, res, next) =>
    sessionCtrl.login(req, res, next),
  );

  // POST /auth/register (Standard User)
  router.post(
    API_ROUTES.AUTH.REGISTER,
    validate(registerSchema),
    (req, res, next) => regCtrl.register(req, res, next),
  );

  // POST /auth/register-manager (Organization Manager)
  router.post(
    API_ROUTES.AUTH.REGISTER_MANAGER,
    validate(registerSchema),
    (req, res, next) => regCtrl.registerManager(req, res, next),
  );

  // --- OTP & Verification ---

  // POST /auth/send-otp
  router.post(
    API_ROUTES.AUTH.SEND_OTP,
    validate(sendOtpSchema),
    (req, res, next) => regCtrl.sendOtp(req, res, next),
  );

  // POST /auth/verify-otp
  router.post(
    API_ROUTES.AUTH.VERIFY_OTP,
    validate(verifyOtpSchema),
    (req, res, next) => regCtrl.verifyOtp(req, res, next),
  );

  // POST /auth/verify-email
  router.post(API_ROUTES.AUTH.VERIFY_EMAIL, (req, res, next) =>
    regCtrl.verifyEmail(req, res, next),
  );

  // --- Signup Completion ---

  // POST /auth/complete-signup
  router.post(
    API_ROUTES.AUTH.COMPLETE_SIGNUP,
    validate(completeSignupSchema),
    (req, res, next) => regCtrl.completeSignup(req, res, next),
  );

  // --- Password Reset ---

  // POST /auth/reset-password-request
  router.post(API_ROUTES.AUTH.RESET_PASSWORD_REQUEST, (req, res, next) =>
    pwdCtrl.resetPasswordReq(req, res, next),
  );

  // POST /auth/reset-password (Complete the reset)
  router.post(API_ROUTES.AUTH.RESET_PASSWORD, (req, res, next) =>
    pwdCtrl.resetPassword(req, res, next),
  );

  // --- Invitations ---

  // POST /auth/invite-member
  router.post(API_ROUTES.AUTH.INVITE_MEMBER, (req, res, next) =>
    inviteCtrl.inviteMember(req, res, next),
  );

  // POST /auth/accept-invite
  router.post(API_ROUTES.AUTH.ACCEPT_INVITE, (req, res, next) =>
    inviteCtrl.acceptInvite(req, res, next),
  );

  // GET /auth/invite/:token (Validate token for UI)
  router.get("/invite/:token", (req, res, next) =>
    inviteCtrl.validateInviteToken(req, res, next),
  );

  // --- OAuth & Session ---

  // POST /auth/google-signin
  router.post(API_ROUTES.AUTH.GOOGLE_SIGNIN, (req, res, next) =>
    sessionCtrl.googleSignIn(req, res, next),
  );

  // POST /auth/refresh-token
  router.post(API_ROUTES.AUTH.REFRESH, (req, res, next) =>
    sessionCtrl.refreshToken(req, res, next),
  );

  // POST /auth/logout
  router.post(
    "/logout",
    (req, res, next) => sessionCtrl.logout(req, res, next),
  );

  return router;
}
