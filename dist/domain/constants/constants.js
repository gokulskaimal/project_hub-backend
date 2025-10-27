"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MESSAGES = exports.API_ROUTES = void 0;
exports.API_ROUTES = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        VERIFY_OTP: '/auth/verify-otp',
        RESET_PASSWORD: '/auth/reset-password',
        COMPLETE_RESET: '/auth/complete-reset'
    },
    ADMIN: {
        ORGANIZATIONS: '/admin/organizations',
        USERS: '/admin/users',
        REPORTS: '/admin/reports'
    },
    MANAGER: {
        INVITE: '/manager/invite',
        BULK_INVITE: '/manager/bulk-invite',
        MEMBERS: '/manager/members',
        ACTIVITY: '/manager/activity'
    },
    USER: {
        PROFILE: '/user/profile',
        CHANGE_PASSWORD: '/user/change-password'
    }
};
exports.MESSAGES = {
    AUTH: {
        LOGIN_SUCCESS: 'Login successful',
        INVALID_CREDENTIALS: 'Invalid email or password',
        TOKEN_EXPIRED: 'Token has expired',
        UNAUTHORIZED: 'Unauthorized access'
    },
    USER: {
        CREATED: 'User created successfully',
        UPDATED: 'User updated successfully',
        DELETED: 'User deleted successfully',
        NOT_FOUND: 'User not found'
    },
    ORGANIZATION: {
        CREATED: 'Organization created successfully',
        UPDATED: 'Organization updated successfully',
        DELETED: 'Organization deleted successfully',
        NOT_FOUND: 'Organization not found'
    }
};
//# sourceMappingURL=constants.js.map