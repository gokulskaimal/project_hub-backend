/**
 * JWT-related type definitions
 */

/**
 * Represents the payload of a JWT token
 * This is a more specific type than using Record<string, any>
 */
export type JwtPayload = {
  // Common JWT claims
  iss?: string; // Issuer
  sub?: string; // Subject (typically user ID)
  aud?: string | string[]; // Audience
  exp?: number; // Expiration time (as Unix timestamp)
  nbf?: number; // Not before time (as Unix timestamp)
  iat?: number; // Issued at time (as Unix timestamp)
  jti?: string; // JWT ID

  // Custom claims - extend with application-specific properties
  [key: string]: unknown;
};

/**
 * Represents options for JWT operations
 * This is a more specific type than using Record<string, any>
 */
export type JwtOptions = {
  // Common options
  algorithm?: string; // Signing algorithm (e.g., 'HS256', 'RS256')
  expiresIn?: string | number; // Expiration time
  notBefore?: string | number; // Not valid before time
  audience?: string | string[]; // Intended audience
  issuer?: string; // Token issuer
  jwtid?: string; // JWT ID
  subject?: string; // Subject (typically user ID)
  noTimestamp?: boolean; // Disable iat claim
  header?: Record<string, unknown>; // Additional header fields
  encoding?: string; // Encoding for string secrets

  // Additional options
  [key: string]: unknown;
};
