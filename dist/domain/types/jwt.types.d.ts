/**
 * Represents the payload of a JWT token
 * This is a more specific type than using Record<string, any>
 */
export type JwtPayload = {
    iss?: string;
    sub?: string;
    aud?: string | string[];
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
    [key: string]: unknown;
};
/**
 * Represents options for JWT operations
 * This is a more specific type than using Record<string, any>
 */
export type JwtOptions = {
    algorithm?: string;
    expiresIn?: string | number;
    notBefore?: string | number;
    audience?: string | string[];
    issuer?: string;
    jwtid?: string;
    subject?: string;
    noTimestamp?: boolean;
    header?: Record<string, unknown>;
    encoding?: string;
    [key: string]: unknown;
};
//# sourceMappingURL=jwt.types.d.ts.map