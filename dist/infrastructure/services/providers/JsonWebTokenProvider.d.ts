import { IJwtProvider } from "../../../domain/interfaces/services/IJwtProvider";
import { JwtPayload, JwtOptions } from "../../../domain/types/jwt.types";
/**
 * Default JWT Provider implementation using jsonwebtoken library
 * Implements the IJwtProvider interface
 */
export declare class JsonWebTokenProvider implements IJwtProvider {
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
//# sourceMappingURL=JsonWebTokenProvider.d.ts.map