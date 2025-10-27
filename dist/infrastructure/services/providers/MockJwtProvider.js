"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockJwtProvider = void 0;
const inversify_1 = require("inversify");
/**
 * Mock JWT Provider implementation for testing purposes
 * Implements the IJwtProvider interface
 * Demonstrates the Open/Closed principle by providing an alternative implementation
 */
let MockJwtProvider = class MockJwtProvider {
    constructor() {
        this._mockTokens = new Map();
    }
    /**
     * Sign a JWT token with the given payload and options
     * @param payload Data to include in the token
     * @param secret Secret key for signing (not used in mock)
     * @param options Additional signing options (not used in mock)
     * @returns Signed JWT token string
     */
    sign(payload, secret, options) {
        // Generate a simple mock token ID
        const tokenId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        // Store the payload with the token ID
        this._mockTokens.set(tokenId, { ...payload });
        // Log the secret and options for debugging purposes
        console.log(`Mock JWT signed with secret: ${secret}`);
        if (options) {
            console.log(`JWT options provided: ${JSON.stringify(options)}`);
        }
        return tokenId;
    }
    /**
     * Verify and decode a JWT token
     * @param token JWT token to verify
     * @param secret Secret key for verification (not used in mock)
     * @param options Additional verification options (not used in mock)
     * @returns Decoded payload or null if invalid
     */
    verify(token, secret, options) {
        // Check if the token exists in our mock storage
        if (this._mockTokens.has(token)) {
            // Log the secret and options for debugging purposes
            console.log(`Mock JWT verified with secret: ${secret}`);
            if (options) {
                console.log(`JWT verification options: ${JSON.stringify(options)}`);
            }
            return this._mockTokens.get(token) || null;
        }
        return null;
    }
    /**
     * Decode a JWT token without verification
     * @param token JWT token to decode
     * @returns Decoded payload or null if invalid format
     */
    decode(token) {
        // In this mock implementation, decode is the same as verify
        if (this._mockTokens.has(token)) {
            return this._mockTokens.get(token) || null;
        }
        return null;
    }
    /**
     * Clear all stored mock tokens
     * Additional method specific to the mock implementation
     */
    clearTokens() {
        this._mockTokens.clear();
    }
};
exports.MockJwtProvider = MockJwtProvider;
exports.MockJwtProvider = MockJwtProvider = __decorate([
    (0, inversify_1.injectable)()
], MockJwtProvider);
//# sourceMappingURL=MockJwtProvider.js.map