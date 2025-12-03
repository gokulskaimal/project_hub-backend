"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../../infrastructure/container/types");
const statusCodes_enum_1 = require("../../infrastructure/config/statusCodes.enum");
const common_constants_1 = require("../../infrastructure/config/common.constants");
const asyncHandler_1 = require("../../utils/asyncHandler");
let AuthController = class AuthController {
    constructor(_logger, _loginUC, _registerUC, _googleSignInUC, _tokenRefreshUC, _logoutUC, _verifyEmailUC, _registerManagerUC, _sendOtpUC, _verifyOtpUC, _completeSignupUC, _inviteMemberUC, _acceptUC, _resetPasswordUC) {
        this._logger = _logger;
        this._loginUC = _loginUC;
        this._registerUC = _registerUC;
        this._googleSignInUC = _googleSignInUC;
        this._tokenRefreshUC = _tokenRefreshUC;
        this._logoutUC = _logoutUC;
        this._verifyEmailUC = _verifyEmailUC;
        this._registerManagerUC = _registerManagerUC;
        this._sendOtpUC = _sendOtpUC;
        this._verifyOtpUC = _verifyOtpUC;
        this._completeSignupUC = _completeSignupUC;
        this._inviteMemberUC = _inviteMemberUC;
        this._acceptUC = _acceptUC;
        this._resetPasswordUC = _resetPasswordUC;
        this.refreshCookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        };
        this.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            // Input already validated by middleware
            const { email, password, name } = req.body;
            this._logger.info("Registering new user", { email, name });
            const created = await this._registerUC.execute(email, password, name);
            this.sendSuccess(res, created, common_constants_1.COMMON_MESSAGES.SIGNUP_COMPLETE, statusCodes_enum_1.StatusCodes.CREATED);
        });
        this.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { email, password } = req.body;
            this._logger.info("Login attempt", { email });
            const result = await this._loginUC.execute(email, password);
            if (result.tokens.refreshToken) {
                res.cookie("refreshToken", result.tokens.refreshToken, this.refreshCookieOptions);
            }
            this._logger.info("User logged in successfully", { userId: result.user.id });
            this.sendSuccess(res, { accessToken: result.tokens.accessToken, user: result.user }, common_constants_1.COMMON_MESSAGES.LOGIN_SUCCESS);
        });
        this.refreshToken = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const refreshToken = req.cookies?.refreshToken;
            this._logger.info("Refresh token attempt");
            if (!refreshToken) {
                this._logger.warn("Refresh token missing");
                res
                    .status(statusCodes_enum_1.StatusCodes.UNAUTHORIZED)
                    .json({ success: false, error: "Missing refresh token" });
                return;
            }
            const tokens = await this._tokenRefreshUC.execute(refreshToken);
            if (tokens.refreshToken) {
                res.cookie("refreshToken", tokens.refreshToken, this.refreshCookieOptions);
            }
            this.sendSuccess(res, { accessToken: tokens.accessToken }, common_constants_1.COMMON_MESSAGES.TOKEN_REFRESHED);
        });
        this.logout = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const refreshToken = req.cookies?.refreshToken;
            this._logger.info("Logout attempt");
            if (refreshToken) {
                try {
                    await this._logoutUC.execute(refreshToken);
                }
                catch (err) {
                    this._logger.warn("Logout revocation failed", {
                        error: err?.message ?? String(err),
                    });
                }
            }
            res.clearCookie("refreshToken", { path: "/" });
            this.sendSuccess(res, null, common_constants_1.COMMON_MESSAGES.LOGOUT_SUCCESS);
        });
        this.registerManager = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { email, organizationName } = req.body;
            this._logger.info("Registering manager", { email, organizationName });
            const result = await this._registerManagerUC.execute(email, organizationName);
            this.sendSuccess(res, result, "Manager registration initiated", statusCodes_enum_1.StatusCodes.CREATED);
        });
        this.sendOtp = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { email } = req.body;
            this._logger.info("Sending OTP", { email });
            const result = await this._sendOtpUC.execute(email);
            this.sendSuccess(res, result, common_constants_1.COMMON_MESSAGES.OTP_SENT);
        });
        this.verifyOtp = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { email, otp } = req.body;
            this._logger.info("Verifying OTP", { email });
            const result = await this._verifyOtpUC.execute(email, otp);
            this.sendSuccess(res, result, common_constants_1.COMMON_MESSAGES.OTP_VERIFIED);
        });
        this.completeSignup = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { email, password, firstName, lastName } = req.body;
            this._logger.info("Completing signup", { email, firstName, lastName });
            const result = await this._completeSignupUC.execute(email, password, firstName, lastName);
            this.sendSuccess(res, result, common_constants_1.COMMON_MESSAGES.SIGNUP_COMPLETE);
        });
        this.inviteMember = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { email, orgId, role } = req.body;
            this._logger.info("Inviting member", { email, orgId, role });
            const result = await this._inviteMemberUC.execute(email, orgId, role);
            this.sendSuccess(res, result, common_constants_1.COMMON_MESSAGES.INVITATION_SENT, statusCodes_enum_1.StatusCodes.CREATED);
        });
        this.acceptInvite = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { token, password, firstName, lastName } = req.body;
            this._logger.info("Accepting invite", {
                token: "REDACTED",
                firstName,
                lastName,
            });
            const result = await this._acceptUC.execute(token, password, firstName, lastName);
            this.sendSuccess(res, result, common_constants_1.COMMON_MESSAGES.ACCEPTED);
        });
        this.validateInviteToken = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { token } = req.params;
            this._logger.info("Validating invite token", { token: "REDACTED" });
            const result = await this._acceptUC.validateInvitationToken(token);
            this.sendSuccess(res, result, "Token validation result");
        });
        this.resetPasswordReq = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { email } = req.body;
            this._logger.info("Requesting password reset", { email });
            const result = await this._resetPasswordUC.requestReset(email);
            this.sendSuccess(res, result, common_constants_1.COMMON_MESSAGES.RESET_SENT);
        });
        this.resetPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { token, password } = req.body;
            this._logger.info("Resetting password", { token: "REDACTED" });
            const result = await this._resetPasswordUC.resetWithToken(token, password);
            this.sendSuccess(res, result, common_constants_1.COMMON_MESSAGES.RESET_SUCCESS);
        });
        this.verifyEmail = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const token = req.body?.token || req.headers["x-verification-token"];
            this._logger.info("Verifying email", { token: "REDACTED" });
            const result = await this._verifyEmailUC.execute(String(token));
            this.sendSuccess(res, result, common_constants_1.COMMON_MESSAGES.EMAIL_VERIFIED);
        });
        this.googleSignIn = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { idToken, inviteToken, orgName } = req.body;
            this._logger.info("Google Sign-In attempt", {
                hasInviteToken: !!inviteToken,
                orgName,
            });
            try {
                const result = await this._googleSignInUC.execute(idToken, inviteToken, orgName);
                if (result.tokens.refreshToken) {
                    res.cookie("refreshToken", result.tokens.refreshToken, this.refreshCookieOptions);
                }
                this._logger.info("Google Sign-In successful", { userId: result.user.id });
                this.sendSuccess(res, { accessToken: result.tokens.accessToken, user: result.user }, common_constants_1.COMMON_MESSAGES.LOGIN_SUCCESS);
            }
            catch (error) {
                const msg = error?.message ?? String(error);
                if (msg === "Organization Name Required") {
                    throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Organization Name Required");
                }
                throw error;
            }
        });
    }
    // Helper to send standard success response
    sendSuccess(res, data, message = "Success", status = statusCodes_enum_1.StatusCodes.OK) {
        res.status(status).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.AuthController = AuthController;
exports.AuthController = AuthController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.ILogger)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.ILoginUseCase)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.IRegisterUseCase)),
    __param(3, (0, inversify_1.inject)(types_1.TYPES.IGoogleSignInUseCase)),
    __param(4, (0, inversify_1.inject)(types_1.TYPES.ITokenRefreshUseCase)),
    __param(5, (0, inversify_1.inject)(types_1.TYPES.ILogoutUseCase)),
    __param(6, (0, inversify_1.inject)(types_1.TYPES.IVerifyEmailUseCase)),
    __param(7, (0, inversify_1.inject)(types_1.TYPES.IRegisterManagerUseCase)),
    __param(8, (0, inversify_1.inject)(types_1.TYPES.ISendOtpUseCase)),
    __param(9, (0, inversify_1.inject)(types_1.TYPES.IVerifyOtpUseCase)),
    __param(10, (0, inversify_1.inject)(types_1.TYPES.ICompleteSignupUseCase)),
    __param(11, (0, inversify_1.inject)(types_1.TYPES.IInviteMemberUseCase)),
    __param(12, (0, inversify_1.inject)(types_1.TYPES.IAcceptUseCase)),
    __param(13, (0, inversify_1.inject)(types_1.TYPES.IResetPasswordUseCase)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], AuthController);
//# sourceMappingURL=AuthController.js.map