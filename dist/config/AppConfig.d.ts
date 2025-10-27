export interface AppConfig {
    port: number;
    nodeEnv: string;
    apiPrefix: string;
    mongoUri: string;
    dbName: string;
    dbPoolSize: number;
    dbTimeout: number;
    jwt: {
        accessSecret: string;
        refreshSecret: string;
        resetSecret: string;
        accessTokenExpiry: string;
        refreshTokenExpiry: string;
        resetTokenExpiry: string;
        issuer: string;
        audience: string;
    };
    session: {
        maxAge: number;
        cookieSecure: boolean;
        sameSite: 'strict' | 'lax' | 'none';
    };
    email: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        password: string;
        from: string;
        maxRetries: number;
    };
    security: {
        bcryptRounds: number;
        rateLimitWindow: number;
        rateLimitMax: number;
        corsOrigin: string | string[];
        cookieSecret: string;
    };
    upload: {
        maxFileSize: number;
        allowedTypes: string[];
        uploadPath: string;
    };
    logging: {
        level: string;
        maxFiles: number;
        maxSize: string;
    };
    otp: {
        expiryMinutes: number;
        length: number;
        maxAttempts: number;
    };
    frontend: {
        url: string;
        resetPasswordPath: string;
        verifyEmailPath: string;
        acceptInvitePath: string;
    };
    features: {
        emailVerificationRequired: boolean;
        invitationRequired: boolean;
        passwordResetEnabled: boolean;
        multiOrgSupport: boolean;
    };
}
/**
 * Load and validate application configuration
 */
export declare function loadConfig(): AppConfig;
export declare const config: AppConfig;
export declare const ENV_TEMPLATE = "\n# Server Configuration\nPORT=4000\nNODE_ENV=development\nAPI_PREFIX=/api\n\n# Database Configuration  \nMONGO_URI=mongodb://localhost:27017/project-hub\nDB_NAME=project-hub\nDB_POOL_SIZE=10\nDB_TIMEOUT=5000\n\n# JWT Configuration\nJWT_ACCESS_SECRET=your-secure-access-secret-key-here\nJWT_REFRESH_SECRET=your-secure-refresh-secret-key-here\nJWT_RESET_SECRET=your-secure-reset-secret-key-here\nJWT_ACCESS_EXPIRY=15m\nJWT_REFRESH_EXPIRY=7d\nJWT_RESET_EXPIRY=1h\nJWT_ISSUER=project-hub\nJWT_AUDIENCE=project-hub-users\n\n# Session Configuration\nSESSION_MAX_AGE=86400000\nCOOKIE_SECURE=true\nCOOKIE_SAME_SITE=strict\nCOOKIE_SECRET=your-secure-cookie-secret-here\n\n# Email Configuration\nEMAIL_HOST=smtp.gmail.com\nEMAIL_PORT=587\nEMAIL_SECURE=false\nEMAIL_USER=your-email@gmail.com\nEMAIL_PASSWORD=your-app-password\nEMAIL_FROM=noreply@project-hub.com\nEMAIL_MAX_RETRIES=3\n\n# Security Configuration\nBCRYPT_ROUNDS=12\nRATE_LIMIT_WINDOW=900000\nRATE_LIMIT_MAX=100\nCORS_ORIGIN=http://localhost:3000,https://yourapp.com\n\n# File Upload Configuration\nUPLOAD_MAX_FILE_SIZE=5242880\nUPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,application/pdf\nUPLOAD_PATH=./uploads\n\n# Logging Configuration\nLOG_LEVEL=info\nLOG_MAX_FILES=10\nLOG_MAX_SIZE=10m\n\n# OTP Configuration\nOTP_EXPIRY_MINUTES=10\nOTP_LENGTH=6\nOTP_MAX_ATTEMPTS=3\n\n# Frontend Configuration\nFRONTEND_URL=http://localhost:3000\nRESET_PASSWORD_PATH=/auth/reset-password\nVERIFY_EMAIL_PATH=/auth/verify-email\nACCEPT_INVITE_PATH=/auth/accept-invite\n\n# Feature Flags\nFEATURE_EMAIL_VERIFICATION_REQUIRED=true\nFEATURE_INVITATION_REQUIRED=false\nFEATURE_PASSWORD_RESET_ENABLED=true\nFEATURE_MULTI_ORG_SUPPORT=true\n";
/**
 * Configuration validation helper
 */
export declare function validateConfig(config: AppConfig): void;
//# sourceMappingURL=AppConfig.d.ts.map