import { IJwtProvider } from "../../../domain/interfaces/services/IJwtProvider";
import { JwtPayload, JwtOptions } from "../../../domain/types/jwt.types";
/**
 * Mock JWT Provider implementation for testing purposes
 * Implements the IJwtProvider interface
 * Demonstrates the Open/Closed principle by providing an alternative implementation
 */
export declare class MockJwtProvider implements IJwtProvider {
    private readonly _mockTokens;
    /**
     * Sign a JWT token with the given payload and options
     * @param payload Data to include in the token
     * @param secret Secret key for signing (not used in mock)
     * @param options Additional signing options (not used in mock)
     * @returns Signed JWT token string
     */
    sign(payload: JwtPayload, secret: string, options?: JwtOptions): string;
    /**
     * Verify and decode a JWT token
     * @param token JWT token to verify
     * @param secret Secret key for verification (not used in mock)
     * @param options Additional verification options (not used in mock)
     * @returns Decoded payload or null if invalid
     */
    verify(token: string, secret: string, options?: JwtOptions): JwtPayload | null;
    /**
     * Decode a JWT token without verification
     * @param token JWT token to decode
     * @returns Decoded payload or null if invalid format
     */
    decode(token: string): JwtPayload | null;
    /**
     * Clear all stored mock tokens
     * Additional method specific to the mock implementation
     */
    clearTokens(): void;
}
//# sourceMappingURL=MockJwtProvider.d.ts.map