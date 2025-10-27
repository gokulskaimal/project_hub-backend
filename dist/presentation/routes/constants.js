"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTH_ROUTES = exports.ADMIN_ROUTES = exports.USER_ROUTES = exports.MANAGER_ROUTES = exports.API_ROUTES = exports.API_PREFIX = void 0;
exports.API_PREFIX = '/api';
exports.API_ROUTES = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        VERIFY_OTP: '/auth/verify-otp',
        RESET_PASSWORD: '/auth/reset-password',
        COMPLETE_RESET: '/auth/complete-reset',
        // ✅ ADDED: Missing routes that authRoutes.ts needs
        REFRESH: '/auth/refresh',
        RESET_PASSWORD_REQUEST: '/auth/reset-password-request',
        VERIFY_EMAIL: '/auth/verify-email',
        REGISTER_MANAGER: '/auth/register-manager',
        SEND_OTP: '/auth/send-otp',
        COMPLETE_SIGNUP: '/auth/complete-signup',
        INVITE_MEMBER: '/auth/invite-member',
        ACCEPT_INVITE: '/auth/accept-invite'
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
// ✅ ADD MANAGER_ROUTES EXPORT FOR BACKWARD COMPATIBILITY
exports.MANAGER_ROUTES = exports.API_ROUTES.MANAGER;
// ✅ ADD OTHER ROUTE EXPORTS FOR CONVENIENCE
exports.USER_ROUTES = exports.API_ROUTES.USER;
exports.ADMIN_ROUTES = exports.API_ROUTES.ADMIN;
exports.AUTH_ROUTES = exports.API_ROUTES.AUTH;
//# sourceMappingURL=constants.js.map