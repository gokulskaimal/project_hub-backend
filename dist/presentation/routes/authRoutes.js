"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthRoutes = createAuthRoutes;
const express_1 = require("express");
const types_1 = require("../../infrastructure/container/types");
const ValidationMiddleware_1 = require("../middleware/ValidationMiddleware");
const apiRoutes_constant_1 = require("../../infrastructure/config/apiRoutes.constant"); // Update import path
// Import Schemas
const authSchemas_1 = require("../validation/authSchemas");
function createAuthRoutes(container) {
    const router = (0, express_1.Router)();
    const sessionCtrl = container.get(types_1.TYPES.SessionController);
    const regCtrl = container.get(types_1.TYPES.RegistrationController);
    const inviteCtrl = container.get(types_1.TYPES.InviteController);
    const pwdCtrl = container.get(types_1.TYPES.PasswordController);
    router.post(apiRoutes_constant_1.API_ROUTES.AUTH.LOGIN, (0, ValidationMiddleware_1.validate)(authSchemas_1.loginSchema), (req, res, next) => sessionCtrl.login(req, res, next));
    router.post(apiRoutes_constant_1.API_ROUTES.AUTH.REGISTER, (0, ValidationMiddleware_1.validate)(authSchemas_1.registerSchema), (req, res, next) => regCtrl.register(req, res, next));
    router.post(apiRoutes_constant_1.API_ROUTES.AUTH.REGISTER_MANAGER, (0, ValidationMiddleware_1.validate)(authSchemas_1.registerSchema), (req, res, next) => regCtrl.registerManager(req, res, next));
    router.post(apiRoutes_constant_1.API_ROUTES.AUTH.SEND_OTP, (0, ValidationMiddleware_1.validate)(authSchemas_1.sendOtpSchema), (req, res, next) => regCtrl.sendOtp(req, res, next));
    router.post(apiRoutes_constant_1.API_ROUTES.AUTH.VERIFY_OTP, (0, ValidationMiddleware_1.validate)(authSchemas_1.verifyOtpSchema), (req, res, next) => regCtrl.verifyOtp(req, res, next));
    router.post(apiRoutes_constant_1.API_ROUTES.AUTH.VERIFY_EMAIL, (req, res, next) => regCtrl.verifyEmail(req, res, next));
    router.post(apiRoutes_constant_1.API_ROUTES.AUTH.COMPLETE_SIGNUP, (0, ValidationMiddleware_1.validate)(authSchemas_1.completeSignupSchema), (req, res, next) => regCtrl.completeSignup(req, res, next));
    router.post(apiRoutes_constant_1.API_ROUTES.AUTH.RESET_PASSWORD_REQUEST, (req, res, next) => pwdCtrl.resetPasswordReq(req, res, next));
    router.post(apiRoutes_constant_1.API_ROUTES.AUTH.RESET_PASSWORD, (req, res, next) => pwdCtrl.resetPassword(req, res, next));
    router.post(apiRoutes_constant_1.API_ROUTES.AUTH.INVITE_MEMBER, (req, res, next) => inviteCtrl.inviteMember(req, res, next));
    router.post(apiRoutes_constant_1.API_ROUTES.AUTH.ACCEPT_INVITE, (req, res, next) => inviteCtrl.acceptInvite(req, res, next));
    router.get(apiRoutes_constant_1.API_ROUTES.AUTH.VALIDATE_INVITE(":token"), (req, res, next) => inviteCtrl.validateInviteToken(req, res, next));
    router.post(apiRoutes_constant_1.API_ROUTES.AUTH.GOOGLE_SIGNIN, (req, res, next) => sessionCtrl.googleSignIn(req, res, next));
    router.post(apiRoutes_constant_1.API_ROUTES.AUTH.REFRESH, (req, res, next) => sessionCtrl.refreshToken(req, res, next));
    router.post(apiRoutes_constant_1.API_ROUTES.AUTH.LOGOUT, (req, res, next) => sessionCtrl.logout(req, res, next));
    return router;
}
//# sourceMappingURL=authRoutes.js.map