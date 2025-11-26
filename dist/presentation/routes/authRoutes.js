"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthRoutes = createAuthRoutes;
const express_1 = require("express");
const types_1 = require("../../infrastructure/container/types");
const ValidationMiddleware_1 = require("../middleware/ValidationMiddleware");
const constants_1 = require("./constants");
// Import Schemas
// Ensure these match the exports in your schemas file
const authSchemas_1 = require("../validation/authSchemas");
function createAuthRoutes(container) {
    const router = (0, express_1.Router)();
    // Resolve the controller from the DI container
    const controller = container.get(types_1.TYPES.AuthController);
    // --- Standard Auth ---
    // POST /auth/login
    router.post(constants_1.API_ROUTES.AUTH.LOGIN, (0, ValidationMiddleware_1.validate)(authSchemas_1.loginSchema), (req, res, next) => controller.login(req, res, next));
    // POST /auth/register (Standard User)
    router.post(constants_1.API_ROUTES.AUTH.REGISTER, (0, ValidationMiddleware_1.validate)(authSchemas_1.registerSchema), (req, res, next) => controller.register(req, res, next));
    // POST /auth/register-manager (Organization Manager)
    // Note: You might need a schema for this if not generic registerSchema
    router.post(constants_1.API_ROUTES.AUTH.REGISTER_MANAGER, (0, ValidationMiddleware_1.validate)(authSchemas_1.registerSchema), (req, res, next) => controller.registerManager(req, res, next));
    // --- OTP & Verification ---
    // POST /auth/send-otp
    router.post(constants_1.API_ROUTES.AUTH.SEND_OTP, (0, ValidationMiddleware_1.validate)(authSchemas_1.sendOtpSchema), (req, res, next) => controller.sendOtp(req, res, next));
    // POST /auth/verify-otp
    router.post(constants_1.API_ROUTES.AUTH.VERIFY_OTP, (0, ValidationMiddleware_1.validate)(authSchemas_1.verifyOtpSchema), (req, res, next) => controller.verifyOtp(req, res, next));
    // POST /auth/verify-email
    router.post(constants_1.API_ROUTES.AUTH.VERIFY_EMAIL, (req, res, next) => controller.verifyEmail(req, res, next));
    // --- Signup Completion ---
    // POST /auth/complete-signup
    router.post(constants_1.API_ROUTES.AUTH.COMPLETE_SIGNUP, (0, ValidationMiddleware_1.validate)(authSchemas_1.completeSignupSchema), (req, res, next) => controller.completeSignup(req, res, next));
    // --- Password Reset ---
    // POST /auth/reset-password-request
    router.post(constants_1.API_ROUTES.AUTH.RESET_PASSWORD_REQUEST, (req, res, next) => controller.resetPasswordReq(req, res, next));
    // POST /auth/reset-password (Complete the reset)
    router.post(constants_1.API_ROUTES.AUTH.RESET_PASSWORD, (req, res, next) => controller.resetPassword(req, res, next));
    // --- Invitations ---
    // POST /auth/invite-member
    router.post(constants_1.API_ROUTES.AUTH.INVITE_MEMBER, (req, res, next) => controller.inviteMember(req, res, next));
    // POST /auth/accept-invite
    router.post(constants_1.API_ROUTES.AUTH.ACCEPT_INVITE, (req, res, next) => controller.acceptInvite(req, res, next));
    // GET /auth/invite/:token (Validate token for UI)
    // Note: This is often a dynamic route, so we handle it specifically if defined in API_ROUTES or manually
    router.get("/invite/:token", (req, res, next) => controller.validateInviteToken(req, res, next));
    // --- OAuth & Session ---
    // POST /auth/google-signin
    router.post(constants_1.API_ROUTES.AUTH.GOOGLE_SIGNIN, (req, res, next) => controller.googleSignIn(req, res, next));
    // POST /auth/refresh-token
    router.post(constants_1.API_ROUTES.AUTH.REFRESH, (req, res, next) => controller.refreshToken(req, res, next));
    // POST /auth/logout
    router.post("/logout", // Often standardized
    (req, res, next) => controller.logout(req, res, next));
    return router;
}
//# sourceMappingURL=authRoutes.js.map