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
const zod_1 = require("zod");
const types_1 = require("../../infrastructure/container/types");
let AuthController = class AuthController {
    constructor(logger, authUseCases, registerManagerUC, sendOtpUC, verifyOtpUC, completeSignupUC, inviteMemberUC, acceptUC, resetPasswordUC) {
        this.logger = logger;
        this.authUseCases = authUseCases;
        this.registerManagerUC = registerManagerUC;
        this.sendOtpUC = sendOtpUC;
        this.verifyOtpUC = verifyOtpUC;
        this.completeSignupUC = completeSignupUC;
        this.inviteMemberUC = inviteMemberUC;
        this.acceptUC = acceptUC;
        this.resetPasswordUC = resetPasswordUC;
        // Keep cookie options centralized
        this.refreshCookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        };
        // Schemas
        this.registerSchema = zod_1.z.object({
            email: zod_1.z.string().email(),
            password: zod_1.z.string().min(6),
            name: zod_1.z.string().optional(),
        });
        this.loginSchema = zod_1.z.object({
            email: zod_1.z.string().email(),
            password: zod_1.z.string().min(1),
        });
        // Methods exposed as arrow functions so routing can pass them directly
        this.register = async (req, res, next) => {
            try {
                const parsed = this.registerSchema.safeParse(req.body);
                if (!parsed.success) {
                    return res.status(400).json({ error: "Invalid input", details: parsed.error.format() });
                }
                const { email, password, name } = parsed.data;
                const created = await this.authUseCases.register(email, password, name);
                // created should be a DTO with public user fields (no password)
                return res.status(201).json({ data: created });
            }
            catch (err) {
                this.logger?.error?.("Error in register controller", err);
                return next(err);
            }
        };
        this.login = async (req, res, next) => {
            try {
                const parsed = this.loginSchema.safeParse(req.body);
                if (!parsed.success) {
                    return res.status(400).json({ error: "Invalid input", details: parsed.error.format() });
                }
                const { email, password } = parsed.data;
                const result = await this.authUseCases.login(email, password);
                const tokens = result.tokens;
                const user = result.user;
                if (tokens.refreshToken) {
                    res.cookie("refreshToken", tokens.refreshToken, this.refreshCookieOptions);
                }
                // Return access token and user info (no sensitive fields)
                return res.json({ accessToken: tokens.accessToken, user });
            }
            catch (err) {
                this.logger?.warn?.("Login failed", err);
                return next(err);
            }
        };
        this.refreshToken = async (req, res, next) => {
            try {
                // read cookie (ensure cookie-parser middleware is used globally)
                const refreshToken = req.cookies?.refreshToken;
                if (!refreshToken) {
                    return res.status(401).json({ error: "Missing refresh token" });
                }
                // Expect the use-case to return { accessToken, refreshToken } (rotated)
                const tokens = await this.authUseCases.refresh(refreshToken);
                // rotate cookie
                if (tokens.refreshToken) {
                    res.cookie("refreshToken", tokens.refreshToken, this.refreshCookieOptions);
                }
                return res.json({ accessToken: tokens.accessToken });
            }
            catch (err) {
                this.logger?.warn?.("Refresh token failed", err);
                return next(err);
            }
        };
        this.logout = async (req, res, next) => {
            try {
                const refreshToken = req.cookies?.refreshToken;
                if (refreshToken) {
                    // logout use-case should revoke the provided refresh token
                    try {
                        await this.authUseCases.logout(refreshToken);
                    }
                    catch (err) {
                        // log and continue to clear cookie; revocation failure shouldn't block logout response
                        this.logger?.warn?.("Failed to revoke refresh token during logout", err);
                    }
                }
                // clear cookie
                res.clearCookie("refreshToken", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                });
                return res.json({ ok: true });
            }
            catch (err) {
                this.logger?.error?.("Logout failed", err);
                return next(err);
            }
        };
        this.registerManager = async (req, res, next) => {
            try {
                const { email, organizationName } = req.body;
                if (!email || !organizationName)
                    return res.status(400).json({ error: 'Missing Fields' });
                const result = await this.registerManagerUC.execute(email, organizationName);
                return res.status(201).json(result);
            }
            catch (err) {
                this.logger?.error?.('Registering Manager Failed', err);
                return next(err);
            }
        };
        this.sendOtp = async (req, res, next) => {
            try {
                const { email } = req.body;
                if (!email)
                    return res.status(400).json({ error: 'Missing Email' });
                const result = await this.sendOtpUC.execute(email);
                return res.json(result);
            }
            catch (err) {
                this.logger?.error?.("Send Otp Failed", err);
                return next(err);
            }
        };
        this.verifyOtp = async (req, res, next) => {
            try {
                const { email, otp } = req.body;
                if (!email || !otp)
                    return res.status(400).json({ error: 'Missing fields' });
                const result = await this.verifyOtpUC.execute(email, otp);
                return res.json(result);
            }
            catch (err) {
                this.logger?.error?.('Verify Otp Failed', err);
                return next(err);
            }
        };
        this.completeSignup = async (req, res, next) => {
            try {
                const { email, password, firstName, lastName } = req.body;
                if (!email || !password || !firstName || !lastName)
                    return res.status(400).json({ error: 'Missing Fields' });
                const result = await this.completeSignupUC.execute(email, password, firstName, lastName);
                return res.json(result);
            }
            catch (err) {
                this.logger?.error?.('Signup failed', err);
                return next(err);
            }
        };
        this.inviteMember = async (req, res, next) => {
            try {
                const { email, orgId, role } = req.body;
                if (!email || !orgId)
                    return res.status(400).json({ error: "Missing fields" });
                const result = await this.inviteMemberUC.execute(email, orgId, role);
                return res.status(201).json(result);
            }
            catch (err) {
                this.logger?.error?.("inviteMember failed", err);
                return next(err);
            }
        };
        this.acceptInvite = async (req, res, next) => {
            try {
                const { token, password, firstName, lastName } = req.body;
                if (!token || !password || !firstName || !lastName)
                    return res.status(400).json({ error: "Missing fields" });
                const result = await this.acceptUC.execute(token, password, firstName, lastName);
                return res.json(result);
            }
            catch (err) {
                this.logger?.error?.("acceptInvite failed", err);
                return next(err);
            }
        };
        this.validateInviteToken = async (req, res, next) => {
            try {
                const { token } = req.params;
                if (!token)
                    return res.status(400).json({ error: "Missing token" });
                const result = await this.acceptUC.validateInvitationToken(token);
                return res.json(result);
            }
            catch (err) {
                this.logger?.error?.("validateInviteToken failed", err);
                return next(err);
            }
        };
        // -----------------------
        // Password reset
        // -----------------------
        this.resetPasswordReq = async (req, res, next) => {
            try {
                const { email } = req.body;
                if (!email)
                    return res.status(400).json({ error: "Missing email" });
                const result = await this.resetPasswordUC.requestReset(email);
                return res.json(result);
            }
            catch (err) {
                this.logger?.error?.("resetPasswordReq failed", err);
                return next(err);
            }
        };
        this.resetPassword = async (req, res, next) => {
            try {
                const { token, password } = req.body;
                if (!token || !password)
                    return res.status(400).json({ error: "Missing fields" });
                const result = await this.resetPasswordUC.resetWithToken(token, password);
                return res.json(result);
            }
            catch (err) {
                this.logger?.error?.("resetPassword failed", err);
                return next(err);
            }
        };
        // -----------------------
        // Verify email (token may be body or header)
        // -----------------------
        this.verifyEmail = async (req, res, next) => {
            try {
                const token = req.body?.token ?? req.headers["x-verification-token"];
                if (!token)
                    return res.status(400).json({ error: "Missing verification token" });
                const result = await this.authUseCases.verifyEmail(String(token));
                return res.json(result);
            }
            catch (err) {
                this.logger?.error?.("verifyEmail failed", err);
                return next(err);
            }
        };
    }
};
exports.AuthController = AuthController;
exports.AuthController = AuthController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.ILogger)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.IAuthUseCases)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.IRegisterManagerUseCase)),
    __param(3, (0, inversify_1.inject)(types_1.TYPES.ISendOtpUseCase)),
    __param(4, (0, inversify_1.inject)(types_1.TYPES.IVerifyOtpUseCase)),
    __param(5, (0, inversify_1.inject)(types_1.TYPES.ICompleteSignupUseCase)),
    __param(6, (0, inversify_1.inject)(types_1.TYPES.IInviteMemberUseCase)),
    __param(7, (0, inversify_1.inject)(types_1.TYPES.IAcceptUseCase)),
    __param(8, (0, inversify_1.inject)(types_1.TYPES.IResetPasswordUseCase)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object])
], AuthController);
//# sourceMappingURL=AuthController.js.map