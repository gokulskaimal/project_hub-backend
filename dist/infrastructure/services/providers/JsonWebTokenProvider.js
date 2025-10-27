"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonWebTokenProvider = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const inversify_1 = require("inversify");
/**
 * Default JWT Provider implementation using jsonwebtoken library
 * Implements the IJwtProvider interface
 */
let JsonWebTokenProvider = class JsonWebTokenProvider {
    /**
     * Sign a JWT token with the given payload and options
     * @param payload Data to include in the token
     * @param secret Secret key for signing
     * @param options Additional signing options
     * @returns Signed JWT token string
     */
    sign(payload, secret, options) {
        try {
            return jsonwebtoken_1.default.sign(payload, secret, options);
        }
        catch (error) {
            throw new Error(`JWT signing failed: ${error.message}`);
        }
    }
    /**
     * Verify and decode a JWT token
     * @param token JWT token to verify
     * @param secret Secret key for verification
     * @param options Additional verification options
     * @returns Decoded payload or null if invalid
     */
    verify(token, secret, options) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, secret, options);
            // Handle both string and object returns
            if (typeof decoded === 'string') {
                return JSON.parse(decoded);
            }
            return decoded;
        }
        catch (error) {
            console.warn('JWT verification failed:', error.message);
            return null;
        }
    }
    /**
     * Decode a JWT token without verification
     * @param token JWT token to decode
     * @returns Decoded payload or null if invalid format
     */
    decode(token) {
        try {
            const decoded = jsonwebtoken_1.default.decode(token);
            if (!decoded) {
                return null;
            }
            if (typeof decoded === 'string') {
                return JSON.parse(decoded);
            }
            return decoded;
        }
        catch (error) {
            console.warn('JWT decoding failed:', error.message);
            return null;
        }
    }
};
exports.JsonWebTokenProvider = JsonWebTokenProvider;
exports.JsonWebTokenProvider = JsonWebTokenProvider = __decorate([
    (0, inversify_1.injectable)()
], JsonWebTokenProvider);
//# sourceMappingURL=JsonWebTokenProvider.js.map