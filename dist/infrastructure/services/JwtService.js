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
exports.JwtService = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../container/types");
/**
 * JWT Service Implementation
 * Uses dependency injection to receive a JWT provider
 * Demonstrates the Open/Closed principle by depending on abstractions
 * Can be extended by injecting different JWT provider implementations
 */
let JwtService = class JwtService {
    /**
     * Constructor with dependency injection for JWT provider
     * @param jwtProvider Implementation of IJwtProvider interface
     */
    constructor(jwtProvider) {
        this.jwtProvider = jwtProvider;
        this._revokedRefreshedTokens = new Map();
        this._revokeForAllUserMap = new Map();
        // Get secrets from environment variables with fallbacks for development
        this._accessTokenSecret =
            process.env.JWT_ACCESS_SECRET ||
                "your-access-secret-key-change-in-production";
        this._refreshTokenSecret =
            process.env.JWT_REFRESH_SECRET ||
                "your-refresh-secret-key-change-in-production";
        this._resetTokenSecret =
            process.env.JWT_RESET_SECRET ||
                "your-reset-secret-key-change-in-production";
        // Get token expiry times from environment variables with fallbacks
        this._accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || "30m";
        this._refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || "7d";
        this._resetTokenExpiry = process.env.JWT_RESET_EXPIRY || "1h";
        // Get issuer and audience from environment variables with fallbacks
        this._issuer = process.env.JWT_ISSUER || "project-hub";
        this._audience = process.env.JWT_AUDIENCE || "project-hub-users";
        // Warn if using default secrets in production
        if (process.env.NODE_ENV === "production") {
            if (!process.env.JWT_ACCESS_SECRET ||
                !process.env.JWT_REFRESH_SECRET ||
                !process.env.JWT_RESET_SECRET) {
                console.error("❌ WARNING: JWT secrets not set in production environment!");
                throw new Error("JWT secrets must be set in production");
            }
        }
    }
    /**
     * Generate access token (short-lived)
     * @param payload Data to include in the token
     * @param expiresIn Optional override for token expiration
     * @returns Signed JWT access token
     */
    generateAccessToken(payload, expiresIn) {
        try {
            const options = {
                expiresIn: expiresIn || this._accessTokenExpiry,
                issuer: this._issuer,
                audience: this._audience,
            };
            return this.jwtProvider.sign(payload, this._accessTokenSecret, options);
        }
        catch (error) {
            throw new Error(`Failed to generate access token: ${error.message}`);
        }
    }
    /**
     * Generate refresh token (long-lived)
     * @param payload Data to include in the token
     * @param expiresIn Optional override for token expiration
     * @returns Signed JWT refresh token
     */
    generateRefreshToken(payload, expiresIn) {
        try {
            const options = {
                expiresIn: expiresIn || this._refreshTokenExpiry,
                issuer: this._issuer,
                audience: this._audience,
            };
            return this.jwtProvider.sign(payload, this._refreshTokenSecret, options);
        }
        catch (error) {
            throw new Error(`Failed to generate refresh token: ${error.message}`);
        }
    }
    /**
     * Verify access token
     * @param token JWT token to verify
     * @returns Decoded payload or null if invalid
     */
    verifyAccessToken(token) {
        const options = {
            issuer: this._issuer,
            audience: this._audience,
        };
        try {
            const payload = this.jwtProvider.verify(token, this._accessTokenSecret, options);
            return payload ?? null;
        }
        catch {
            return null;
        }
    }
    /**
     * Verify refresh token
     * @param token JWT token to verify
     * @returns Decoded payload or null if invalid
     */
    verifyRefreshToken(token) {
        const revokedExpiry = this._revokedRefreshedTokens.get(token);
        if (revokedExpiry && revokedExpiry > Date.now()) {
            return null;
        }
        if (revokedExpiry && revokedExpiry <= Date.now()) {
            this._revokedRefreshedTokens.delete(token);
        }
        const options = {
            issuer: this._issuer,
            audience: this._audience,
        };
        try {
            const payload = this.jwtProvider.verify(token, this._resetTokenSecret, options);
            if (!payload)
                return null;
            if (payload.id && this._revokeForAllUserMap.has(payload.id)) {
                const revokedAt = this._revokeForAllUserMap.get(payload.id);
                if (payload.iat && typeof payload.iat == "number") {
                    const issuedAtMs = payload.iat * 1000;
                    if (revokedAt && issuedAtMs < revokedAt) {
                        return null;
                    }
                }
            }
            return payload;
        }
        catch {
            return null;
        }
    }
    verifyResetToken(token) {
        const options = {
            issuer: this._issuer,
            audience: this._audience,
        };
        try {
            const payload = this.jwtProvider.verify(token, this._resetTokenSecret, options);
            return payload ?? null;
        }
        catch {
            return null;
        }
    }
    /**
     * Generate password reset token
     * @param payload Data to include in the token
     * @param expiresIn Optional override for token expiration
     * @returns Signed JWT reset token
     */
    generateResetToken(payload, expiresIn) {
        try {
            const options = {
                expiresIn: expiresIn || this._resetTokenExpiry,
                issuer: this._issuer,
                audience: this._audience,
            };
            return this.jwtProvider.sign(payload, this._resetTokenSecret, options);
        }
        catch (error) {
            throw new Error(`Failed to generate reset token: ${error.message}`);
        }
    }
    /**
     * Verify password reset token
     * @param token JWT token to verify
     * @returns Decoded payload or null if invalid
     */
    /**
     * Decode a JWT token without verification
     * @param token JWT token to decode
     * @returns Decoded payload or null if invalid format
     */
    decodeToken(token) {
        try {
            return this.jwtProvider.decode(token);
        }
        catch {
            return null;
        }
    }
    async revokeRefreshToken(token) {
        try {
            const decode = this.decodeToken(token);
            if (decode && decode.exp && typeof decode.exp == "number") {
                const expiryMs = decode.exp * 1000;
                if (expiryMs > Date.now()) {
                    this._revokedRefreshedTokens.set(token, expiryMs);
                    const ttl = expiryMs - Date.now();
                    setTimeout(() => {
                        this._revokedRefreshedTokens.delete(token);
                    }, Math.max(0, ttl));
                }
            }
            else {
                const fallbackExpiry = Date.now() + 24 * 60 * 60 * 1000;
                this._revokedRefreshedTokens.set(token, fallbackExpiry);
                setTimeout(() => {
                    this._revokedRefreshedTokens.delete(token);
                }, 24 * 60 * 60 * 1000);
            }
        }
        catch (err) {
            console.warn("Failed to revoke refresh token ", err.message);
        }
    }
    async revokeAllForUser(userId) {
        try {
            const now = Date.now();
            this._revokeForAllUserMap.set(userId, now);
        }
        catch (err) {
            console.warn("Failed to revoke all tokens for user ", err.message);
        }
    }
};
exports.JwtService = JwtService;
exports.JwtService = JwtService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.IJwtProvider)),
    __metadata("design:paramtypes", [Object])
], JwtService);
//# sourceMappingURL=JwtService.js.map