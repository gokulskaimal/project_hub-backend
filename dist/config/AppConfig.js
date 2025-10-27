"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV_TEMPLATE = exports.config = void 0;
exports.loadConfig = loadConfig;
exports.validateConfig = validateConfig;
/**
 * Load and validate application configuration
 */
function loadConfig() {
    // Helper function to parse boolean environment variables
    const parseBoolean = (value, defaultValue) => {
        if (value === undefined)
            return defaultValue;
        return value.toLowerCase() === 'true';
    };
    // Helper function to parse number environment variables
    const parseNumber = (value, defaultValue) => {
        if (value === undefined)
            return defaultValue;
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    };
    // Helper function to parse array environment variables
    const parseArray = (value, defaultValue) => {
        if (value === undefined)
            return defaultValue;
        return value.split(',').map(item => item.trim());
    };
    const config = {
        // Server Configuration
        port: parseNumber(process.env.PORT, 4000),
        nodeEnv: process.env.NODE_ENV || 'development',
        apiPrefix: process.env.API_PREFIX || '/api',
        // Database Configuration
        mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/project-hub',
        dbName: process.env.DB_NAME || 'project-hub',
        dbPoolSize: parseNumber(process.env.DB_POOL_SIZE, 10),
        dbTimeout: parseNumber(process.env.DB_TIMEOUT, 5000),
        // JWT Configuration
        jwt: {
            accessSecret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key-change-in-production',
            refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
            resetSecret: process.env.JWT_RESET_SECRET || 'your-reset-secret-key-change-in-production',
            accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
            refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
            resetTokenExpiry: process.env.JWT_RESET_EXPIRY || '1h',
            issuer: process.env.JWT_ISSUER || 'project-hub',
            audience: process.env.JWT_AUDIENCE || 'project-hub-users'
        },
        // Session Configuration
        session: {
            maxAge: parseNumber(process.env.SESSION_MAX_AGE, 24 * 60 * 60 * 1000), // 24 hours in milliseconds
            cookieSecure: parseBoolean(process.env.COOKIE_SECURE, process.env.NODE_ENV === 'production'),
            sameSite: process.env.COOKIE_SAME_SITE || 'strict'
        },
        // Email Configuration
        email: {
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseNumber(process.env.EMAIL_PORT, 587),
            secure: parseBoolean(process.env.EMAIL_SECURE, false),
            user: process.env.EMAIL_USER || '',
            password: process.env.EMAIL_PASSWORD || '',
            from: process.env.EMAIL_FROM || 'noreply@project-hub.com',
            maxRetries: parseNumber(process.env.EMAIL_MAX_RETRIES, 3)
        },
        // Security Configuration
        security: {
            bcryptRounds: parseNumber(process.env.BCRYPT_ROUNDS, 12),
            rateLimitWindow: parseNumber(process.env.RATE_LIMIT_WINDOW, 15 * 60 * 1000), // 15 minutes
            rateLimitMax: parseNumber(process.env.RATE_LIMIT_MAX, 100),
            corsOrigin: process.env.CORS_ORIGIN
                ? parseArray(process.env.CORS_ORIGIN, ['http://localhost:3000'])
                : ['http://localhost:3000'],
            cookieSecret: process.env.COOKIE_SECRET || 'your-cookie-secret-change-in-production'
        },
        // File Upload Configuration
        upload: {
            maxFileSize: parseNumber(process.env.UPLOAD_MAX_FILE_SIZE, 5 * 1024 * 1024), // 5MB
            allowedTypes: parseArray(process.env.UPLOAD_ALLOWED_TYPES, ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']),
            uploadPath: process.env.UPLOAD_PATH || './uploads'
        },
        // Logging Configuration
        logging: {
            level: process.env.LOG_LEVEL || 'info',
            maxFiles: parseNumber(process.env.LOG_MAX_FILES, 10),
            maxSize: process.env.LOG_MAX_SIZE || '10m'
        },
        // OTP Configuration
        otp: {
            expiryMinutes: parseNumber(process.env.OTP_EXPIRY_MINUTES, 10),
            length: parseNumber(process.env.OTP_LENGTH, 6),
            maxAttempts: parseNumber(process.env.OTP_MAX_ATTEMPTS, 3)
        },
        // Frontend Configuration
        frontend: {
            url: process.env.FRONTEND_URL || 'http://localhost:3000',
            resetPasswordPath: process.env.RESET_PASSWORD_PATH || '/auth/reset-password',
            verifyEmailPath: process.env.VERIFY_EMAIL_PATH || '/auth/verify-email',
            acceptInvitePath: process.env.ACCEPT_INVITE_PATH || '/auth/accept-invite'
        },
        // Feature Flags
        features: {
            emailVerificationRequired: parseBoolean(process.env.FEATURE_EMAIL_VERIFICATION_REQUIRED, true),
            invitationRequired: parseBoolean(process.env.FEATURE_INVITATION_REQUIRED, false),
            passwordResetEnabled: parseBoolean(process.env.FEATURE_PASSWORD_RESET_ENABLED, true),
            multiOrgSupport: parseBoolean(process.env.FEATURE_MULTI_ORG_SUPPORT, true)
        }
    };
    // Validate critical configuration in production
    if (config.nodeEnv === 'production') {
        const requiredEnvVars = [
            'MONGO_URI',
            'JWT_ACCESS_SECRET',
            'JWT_REFRESH_SECRET',
            'JWT_RESET_SECRET',
            'EMAIL_HOST',
            'EMAIL_USER',
            'EMAIL_PASSWORD',
            'COOKIE_SECRET'
        ];
        const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables in production: ${missing.join(', ')}`);
        }
        // Validate JWT secrets are not default values
        const defaultSecrets = [
            'your-access-secret-key-change-in-production',
            'your-refresh-secret-key-change-in-production',
            'your-reset-secret-key-change-in-production',
            'your-cookie-secret-change-in-production'
        ];
        const usingDefaultSecrets = [
            config.jwt.accessSecret,
            config.jwt.refreshSecret,
            config.jwt.resetSecret,
            config.security.cookieSecret
        ].some(secret => defaultSecrets.includes(secret));
        if (usingDefaultSecrets) {
            throw new Error('Default secrets detected in production. Please set proper JWT and cookie secrets.');
        }
    }
    return config;
}
// Export singleton configuration instance
exports.config = loadConfig();
// Environment variables template for reference
exports.ENV_TEMPLATE = `
# Server Configuration
PORT=4000
NODE_ENV=development
API_PREFIX=/api

# Database Configuration  
MONGO_URI=mongodb://localhost:27017/project-hub
DB_NAME=project-hub
DB_POOL_SIZE=10
DB_TIMEOUT=5000

# JWT Configuration
JWT_ACCESS_SECRET=your-secure-access-secret-key-here
JWT_REFRESH_SECRET=your-secure-refresh-secret-key-here
JWT_RESET_SECRET=your-secure-reset-secret-key-here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
JWT_RESET_EXPIRY=1h
JWT_ISSUER=project-hub
JWT_AUDIENCE=project-hub-users

# Session Configuration
SESSION_MAX_AGE=86400000
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict
COOKIE_SECRET=your-secure-cookie-secret-here

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@project-hub.com
EMAIL_MAX_RETRIES=3

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
CORS_ORIGIN=http://localhost:3000,https://yourapp.com

# File Upload Configuration
UPLOAD_MAX_FILE_SIZE=5242880
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,application/pdf
UPLOAD_PATH=./uploads

# Logging Configuration
LOG_LEVEL=info
LOG_MAX_FILES=10
LOG_MAX_SIZE=10m

# OTP Configuration
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6
OTP_MAX_ATTEMPTS=3

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
RESET_PASSWORD_PATH=/auth/reset-password
VERIFY_EMAIL_PATH=/auth/verify-email
ACCEPT_INVITE_PATH=/auth/accept-invite

# Feature Flags
FEATURE_EMAIL_VERIFICATION_REQUIRED=true
FEATURE_INVITATION_REQUIRED=false
FEATURE_PASSWORD_RESET_ENABLED=true
FEATURE_MULTI_ORG_SUPPORT=true
`;
/**
 * Configuration validation helper
 */
function validateConfig(config) {
    const errors = [];
    // Validate JWT token expiry formats
    const timeFormats = /^(\d+)(s|m|h|d)$/;
    if (!timeFormats.test(config.jwt.accessTokenExpiry)) {
        errors.push('JWT_ACCESS_EXPIRY must be in format like "15m", "1h", "7d"');
    }
    if (!timeFormats.test(config.jwt.refreshTokenExpiry)) {
        errors.push('JWT_REFRESH_EXPIRY must be in format like "15m", "1h", "7d"');
    }
    // Validate email configuration
    if (config.email.port < 1 || config.email.port > 65535) {
        errors.push('EMAIL_PORT must be between 1 and 65535');
    }
    // Validate session max age
    if (config.session.maxAge < 60000) { // Minimum 1 minute
        errors.push('SESSION_MAX_AGE must be at least 60000 milliseconds (1 minute)');
    }
    if (errors.length > 0) {
        throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }
}
// Validate configuration on load
try {
    validateConfig(exports.config);
    console.log('✅ Configuration loaded and validated successfully');
}
catch (error) {
    console.error('❌ Configuration validation failed:', error);
    process.exit(1);
}
//# sourceMappingURL=AppConfig.js.map