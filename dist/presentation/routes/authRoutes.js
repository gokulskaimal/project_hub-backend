"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserRepo_1 = require("../../infrastructure/repositories/UserRepo");
const OrgRepo_1 = require("../../infrastructure/repositories/OrgRepo");
const InviteRepo_1 = require("../../infrastructure/repositories/InviteRepo");
const OTPService_1 = require("../../infrastructure/services/OTPService");
const EmailService_1 = require("../../infrastructure/services/EmailService");
const HashService_1 = require("../../infrastructure/services/HashService");
const Logger_1 = require("../../infrastructure/services/Logger");
const JsonWebTokenProvider_1 = require("../../infrastructure/services/providers/JsonWebTokenProvider");
const JwtService_1 = require("../../infrastructure/services/JwtService");
const RedisCacheService_1 = require("../../infrastructure/services/RedisCacheService");
const RegisterManagerUseCase_1 = require("../../application/useCase/RegisterManagerUseCase");
const SendOtpUseCase_1 = require("../../application/useCase/SendOtpUseCase");
const VerifyOtpUseCase_1 = require("../../application/useCase/VerifyOtpUseCase");
const CompleteSignupUseCase_1 = require("../../application/useCase/CompleteSignupUseCase");
const InviteMemberUseCase_1 = require("../../application/useCase/InviteMemberUseCase");
const AcceptUseCase_1 = require("../../application/useCase/AcceptUseCase");
const AuthUseCase_1 = require("../../application/useCase/AuthUseCase");
const ResetPasswordUseCase_1 = require("../../application/useCase/ResetPasswordUseCase");
const constants_1 = require("./constants");
const AuthController_1 = require("../controllers/AuthController");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const userRepo = new UserRepo_1.UserRepo();
const orgRepo = new OrgRepo_1.OrgRepo();
const otpService = new OTPService_1.OtpService();
const emailService = new EmailService_1.EmailService();
const cache = new RedisCacheService_1.RedisCacheService();
const inviteRepo = new InviteRepo_1.InviteRepo();
const hashService = new HashService_1.HashService();
const jwtProvider = new JsonWebTokenProvider_1.JsonWebTokenProvider();
const jwtService = new JwtService_1.JwtService(jwtProvider);
const logger = new Logger_1.Logger();
const resetPasswordUC = new ResetPasswordUseCase_1.ResetPasswordUseCase(userRepo, hashService, jwtService, emailService, logger);
const authUseCase = new AuthUseCase_1.AuthUseCases(userRepo, hashService, jwtService, resetPasswordUC, logger, orgRepo);
const registerManagerUC = new RegisterManagerUseCase_1.RegisterManagerUseCase(userRepo, otpService, emailService, logger, orgRepo);
const sendOtpUC = new SendOtpUseCase_1.SendOtpUseCase(userRepo, otpService, emailService, logger, cache);
const verifyOtpUC = new VerifyOtpUseCase_1.VerifyOtpUseCase(userRepo, logger, cache);
const completeSignupUC = new CompleteSignupUseCase_1.CompleteSignupUseCase(userRepo, logger, hashService, jwtService);
const inviteMemberUC = new InviteMemberUseCase_1.InviteMemberUseCase(inviteRepo, emailService, logger, orgRepo, userRepo);
const acceptUC = new AcceptUseCase_1.AcceptUseCase(inviteRepo, userRepo, logger, hashService, jwtService);
const authController = new AuthController_1.AuthController(logger, authUseCase, registerManagerUC, sendOtpUC, verifyOtpUC, completeSignupUC, inviteMemberUC, acceptUC, resetPasswordUC);
const router = express_1.default.Router();
//AUTH_ROUTES constants
router.post(constants_1.AUTH_ROUTES.LOGIN, (req, res, next) => authController.login(req, res, next));
router.post(constants_1.AUTH_ROUTES.REFRESH, (req, res, next) => authController.refreshToken(req, res, next));
router.post(constants_1.AUTH_ROUTES.RESET_PASSWORD_REQUEST, async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await resetPasswordUC.requestReset(email);
        return res.json(result);
    }
    catch (err) {
        return next(err);
    }
});
router.post(constants_1.AUTH_ROUTES.RESET_PASSWORD, async (req, res, next) => {
    try {
        const { token, password } = req.body;
        const result = await resetPasswordUC.resetWithToken(token, password);
        return res.json(result);
    }
    catch (err) {
        next(err);
    }
});
router.post(constants_1.AUTH_ROUTES.VERIFY_EMAIL, AuthMiddleware_1.authMiddleware, async (req, res, next) => {
    try {
        const token = req.body?.token ?? req.headers["x-verification-token"];
        if (!token)
            return res.status(400).json({ error: 'Verification token missing' });
        const result = await authUseCase.verifyEmail(token);
        return res.json(result);
    }
    catch (err) {
        return next(err);
    }
});
router.post(constants_1.AUTH_ROUTES.REGISTER_MANAGER, async (req, res, next) => {
    try {
        const { email, organizationName } = req.body;
        const result = await registerManagerUC.execute(email, organizationName);
        return res.status(201).json(result);
    }
    catch (err) {
        return next(err);
    }
});
router.post(constants_1.AUTH_ROUTES.SEND_OTP, async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await sendOtpUC.execute(email);
        return res.json(result);
    }
    catch (err) {
        return next(err);
    }
});
router.post(constants_1.AUTH_ROUTES.VERIFY_OTP, async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const result = await verifyOtpUC.execute(email, otp);
        return res.json(result);
    }
    catch (err) {
        return next(err);
    }
});
router.post(constants_1.AUTH_ROUTES.COMPLETE_SIGNUP, async (req, res, next) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        const result = await completeSignupUC.execute(email, password, firstName, lastName);
        return res.json(result);
    }
    catch (err) {
        return next(err);
    }
});
router.post(constants_1.AUTH_ROUTES.INVITE_MEMBER, async (req, res, next) => {
    try {
        const { email, orgId, role } = req.body;
        const result = await inviteMemberUC.execute(email, orgId, role);
        return res.status(201).json(result);
    }
    catch (err) {
        return next(err);
    }
});
router.post(constants_1.AUTH_ROUTES.ACCEPT_INVITE, async (req, res, next) => {
    try {
        const { token, password, firstName, lastName } = req.body;
        const result = await acceptUC.execute(token, password, firstName, lastName);
        return res.json(result);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=authRoutes.js.map