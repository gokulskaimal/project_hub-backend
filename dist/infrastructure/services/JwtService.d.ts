import { IJwtService, JwtPayload } from "../../domain/interfaces/services/IJwtService";
import { IJwtProvider } from "../../domain/interfaces/services/IJwtProvider";
/**
 * JWT Service Implementation
 * Uses dependency injection to receive a JWT provider
 * Demonstrates the Open/Closed principle by depending on abstractions
 * Can be extended by injecting different JWT provider implementations
 */
export declare class JwtService implements IJwtService {
    private readonly jwtProvider;
    private readonly _accessTokenSecret;
    private readonly _refreshTokenSecret;
    private readonly _resetTokenSecret;
    private readonly _accessTokenExpiry;
    private readonly _refreshTokenExpiry;
    private readonly _resetTokenExpiry;
    private readonly _issuer;
    private readonly _audience;
    private readonly revokedRefreshedTokens;
    private readonly revokeForAllUserMap;
    /**
     * Constructor with dependency injection for JWT provider
     * @param jwtProvider Implementation of IJwtProvider interface
     */
    constructor(jwtProvider: IJwtProvider);
    /**
     * Generate access token (short-lived)
     * @param payload Data to include in the token
     * @param expiresIn Optional override for token expiration
     * @returns Signed JWT access token
     */
    generateAccessToken(payload: JwtPayload, expiresIn?: string): string;
    /**
     * Generate refresh token (long-lived)
     * @param payload Data to include in the token
     * @param expiresIn Optional override for token expiration
     * @returns Signed JWT refresh token
     */
    generateRefreshToken(payload: JwtPayload, expiresIn?: string): string;
    /**
     * Verify access token
     * @param token JWT token to verify
     * @returns Decoded payload or null if invalid
     */
    verifyAccessToken(token: string): JwtPayload | null;
    /**
     * Verify refresh token
     * @param token JWT token to verify
     * @returns Decoded payload or null if invalid
     */
    verifyRefreshToken(token: string): JwtPayload | null;
    verifyResetToken(token: string): JwtPayload | null;
    /**
     * Generate password reset token
     * @param payload Data to include in the token
     * @param expiresIn Optional override for token expiration
     * @returns Signed JWT reset token
     */
    generateResetToken(payload: Record<string, any>, expiresIn?: string): string;
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
    decodeToken(token: string): JwtPayload | null;
    revokeRefreshToken(token: string): Promise<void>;
    revokeAllForUser(userId: string): Promise<void>;
}
//# sourceMappingURL=JwtService.d.ts.map