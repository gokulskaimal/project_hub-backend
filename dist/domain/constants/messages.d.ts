/**
 * Common response messages used throughout the application
 * Centralized to ensure consistency in API responses
 */
export declare const MESSAGES: {
    readonly AUTH: {
        readonly LOGIN_SUCCESS: "Login successful";
        readonly LOGOUT_SUCCESS: "Logout successful";
        readonly INVALID_CREDENTIALS: "Invalid email or password";
        readonly TOKEN_EXPIRED: "Token has expired";
        readonly TOKEN_INVALID: "Invalid token";
        readonly TOKEN_REFRESHED: "Token refreshed successfully";
        readonly UNAUTHORIZED: "Unauthorized access";
        readonly FORBIDDEN: "Forbidden access";
        readonly PASSWORD_RESET_SENT: "Password reset instructions sent to your email";
        readonly PASSWORD_RESET_SUCCESS: "Password reset successfully";
        readonly EMAIL_VERIFIED: "Email verified successfully";
        readonly OTP_SENT: "OTP sent to your email";
        readonly OTP_VERIFIED: "OTP verified successfully";
        readonly OTP_INVALID: "Invalid OTP";
        readonly OTP_EXPIRED: "OTP has expired";
        readonly REGISTRATION_SUCCESS: "Registration successful";
        readonly ACCOUNT_LOCKED: "Account locked due to too many failed attempts";
    };
    readonly USER: {
        readonly CREATED: "User created successfully";
        readonly UPDATED: "User updated successfully";
        readonly DELETED: "User deleted successfully";
        readonly NOT_FOUND: "User not found";
        readonly PROFILE_UPDATED: "Profile updated successfully";
        readonly PASSWORD_CHANGED: "Password changed successfully";
        readonly EMAIL_ALREADY_EXISTS: "Email already in use";
        readonly INVALID_ROLE: "Invalid user role";
    };
    readonly ORGANIZATION: {
        readonly CREATED: "Organization created successfully";
        readonly UPDATED: "Organization updated successfully";
        readonly DELETED: "Organization deleted successfully";
        readonly NOT_FOUND: "Organization not found";
        readonly MEMBER_ADDED: "Member added to organization";
        readonly MEMBER_REMOVED: "Member removed from organization";
        readonly MEMBER_ROLE_UPDATED: "Member role updated";
    };
    readonly INVITE: {
        readonly SENT: "Invitation sent successfully";
        readonly ACCEPTED: "Invitation accepted";
        readonly EXPIRED: "Invitation has expired";
        readonly INVALID: "Invalid invitation";
        readonly ALREADY_ACCEPTED: "Invitation already accepted";
        readonly RESENT: "Invitation resent successfully";
    };
    readonly VALIDATION: {
        readonly REQUIRED_FIELD: "This field is required";
        readonly INVALID_EMAIL: "Invalid email format";
        readonly PASSWORD_TOO_WEAK: "Password does not meet security requirements";
        readonly INVALID_INPUT: "Invalid input data";
        readonly INVALID_ID: "Invalid ID format";
    };
    readonly GENERAL: {
        readonly SUCCESS: "Operation successful";
        readonly ERROR: "An error occurred";
        readonly NOT_FOUND: "Resource not found";
        readonly CREATED: "Resource created successfully";
        readonly UPDATED: "Resource updated successfully";
        readonly DELETED: "Resource deleted successfully";
        readonly INVALID_REQUEST: "Invalid request";
        readonly SERVER_ERROR: "Internal server error";
        readonly BAD_REQUEST: "Bad request";
        readonly RATE_LIMITED: "Too many requests, please try again later";
    };
};
//# sourceMappingURL=messages.d.ts.map