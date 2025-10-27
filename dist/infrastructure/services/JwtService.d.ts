import { IJwtService } from '../../domain/interfaces/services/IJwtService ';
import { IJwtProvider } from '../../domain/interfaces/services/IJwtProvider';
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
    generateAccessToken(payload: Record<string, any>, expiresIn?: string): string;
    /**
     * Generate refresh token (long-lived)
     * @param payload Data to include in the token
     * @param expiresIn Optional override for token expiration
     * @returns Signed JWT refresh token
     */
    generateRefreshToken(payload: Record<string, any>, expiresIn?: string): string;
    /**
     * Verify access token
     * @param token JWT token to verify
     * @returns Decoded payload or null if invalid
     */
    verifyAccessToken(token: string): Record<string, any> | null;
    /**
     * Verify refresh token
     * @param token JWT token to verify
     * @returns Decoded payload or null if invalid
     */
    verifyRefreshToken(token: string): Record<string, any> | null;
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
    verifyResetToken(token: string): Record<string, any> | null;
    /**
     * Decode a JWT token without verification
     * @param token JWT token to decode
     * @returns Decoded payload or null if invalid format
     */
    decodeToken(token: string): Record<string, any> | null;
}
//# sourceMappingURL=JwtService.d.ts.map