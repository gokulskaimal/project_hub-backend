"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MESSAGES = void 0;
/**
 * Common response messages used throughout the application
 * Centralized to ensure consistency in API responses
 */
exports.MESSAGES = {
    AUTH: {
        LOGIN_SUCCESS: 'Login successful',
        LOGOUT_SUCCESS: 'Logout successful',
        INVALID_CREDENTIALS: 'Invalid email or password',
        TOKEN_EXPIRED: 'Token has expired',
        TOKEN_INVALID: 'Invalid token',
        TOKEN_REFRESHED: 'Token refreshed successfully',
        UNAUTHORIZED: 'Unauthorized access',
        FORBIDDEN: 'Forbidden access',
        PASSWORD_RESET_SENT: 'Password reset instructions sent to your email',
        PASSWORD_RESET_SUCCESS: 'Password reset successfully',
        EMAIL_VERIFIED: 'Email verified successfully',
        OTP_SENT: 'OTP sent to your email',
        OTP_VERIFIED: 'OTP verified successfully',
        OTP_INVALID: 'Invalid OTP',
        OTP_EXPIRED: 'OTP has expired',
        REGISTRATION_SUCCESS: 'Registration successful',
        ACCOUNT_LOCKED: 'Account locked due to too many failed attempts'
    },
    USER: {
        CREATED: 'User created successfully',
        UPDATED: 'User updated successfully',
        DELETED: 'User deleted successfully',
        NOT_FOUND: 'User not found',
        PROFILE_UPDATED: 'Profile updated successfully',
        PASSWORD_CHANGED: 'Password changed successfully',
        EMAIL_ALREADY_EXISTS: 'Email already in use',
        INVALID_ROLE: 'Invalid user role'
    },
    ORGANIZATION: {
        CREATED: 'Organization created successfully',
        UPDATED: 'Organization updated successfully',
        DELETED: 'Organization deleted successfully',
        NOT_FOUND: 'Organization not found',
        MEMBER_ADDED: 'Member added to organization',
        MEMBER_REMOVED: 'Member removed from organization',
        MEMBER_ROLE_UPDATED: 'Member role updated'
    },
    INVITE: {
        SENT: 'Invitation sent successfully',
        ACCEPTED: 'Invitation accepted',
        EXPIRED: 'Invitation has expired',
        INVALID: 'Invalid invitation',
        ALREADY_ACCEPTED: 'Invitation already accepted',
        RESENT: 'Invitation resent successfully'
    },
    VALIDATION: {
        REQUIRED_FIELD: 'This field is required',
        INVALID_EMAIL: 'Invalid email format',
        PASSWORD_TOO_WEAK: 'Password does not meet security requirements',
        INVALID_INPUT: 'Invalid input data',
        INVALID_ID: 'Invalid ID format'
    },
    GENERAL: {
        SUCCESS: 'Operation successful',
        ERROR: 'An error occurred',
        NOT_FOUND: 'Resource not found',
        CREATED: 'Resource created successfully',
        UPDATED: 'Resource updated successfully',
        DELETED: 'Resource deleted successfully',
        INVALID_REQUEST: 'Invalid request',
        SERVER_ERROR: 'Internal server error',
        BAD_REQUEST: 'Bad request',
        RATE_LIMITED: 'Too many requests, please try again later'
    }
};
//# sourceMappingURL=messages.js.map