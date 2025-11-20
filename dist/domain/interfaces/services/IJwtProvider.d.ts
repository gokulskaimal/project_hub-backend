/**
 * JWT Provider Interface
 * Defines the contract for different JWT implementations
 * Follows the Open/Closed principle by allowing extension through new providers
 */
import { JwtPayload, JwtOptions } from "../../types/jwt.types";
export interface IJwtProvider {
    /**
     * Sign a JWT token with the given payload and options
     * @param payload Data to include in the token
     * @param secret Secret key for signing
     * @param options Additional signing options
     * @returns Signed JWT token string
     */
    sign(payload: JwtPayload, secret: string, options?: JwtOptions): string;
    /**
     * Verify and decode a JWT token
     * @param token JWT token to verify
     * @param secret Secret key for verification
     * @param options Additional verification options
     * @returns Decoded payload or null if invalid
     */
    verify(token: string, secret: string, options?: JwtOptions): JwtPayload | null;
    /**
     * Decode a JWT token without verification
     * @param token JWT token to decode
     * @returns Decoded payload or null if invalid format
     */
    decode(token: string): JwtPayload | null;
}
//# sourceMappingURL=IJwtProvider.d.ts.map