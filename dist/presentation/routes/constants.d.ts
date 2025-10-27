export declare const API_PREFIX = "/api";
export declare const API_ROUTES: {
    readonly AUTH: {
        readonly LOGIN: "/auth/login";
        readonly REGISTER: "/auth/register";
        readonly VERIFY_OTP: "/auth/verify-otp";
        readonly RESET_PASSWORD: "/auth/reset-password";
        readonly COMPLETE_RESET: "/auth/complete-reset";
        readonly REFRESH: "/auth/refresh";
        readonly RESET_PASSWORD_REQUEST: "/auth/reset-password-request";
        readonly VERIFY_EMAIL: "/auth/verify-email";
        readonly REGISTER_MANAGER: "/auth/register-manager";
        readonly SEND_OTP: "/auth/send-otp";
        readonly COMPLETE_SIGNUP: "/auth/complete-signup";
        readonly INVITE_MEMBER: "/auth/invite-member";
        readonly ACCEPT_INVITE: "/auth/accept-invite";
    };
    readonly ADMIN: {
        readonly ORGANIZATIONS: "/admin/organizations";
        readonly USERS: "/admin/users";
        readonly REPORTS: "/admin/reports";
    };
    readonly MANAGER: {
        readonly INVITE: "/manager/invite";
        readonly BULK_INVITE: "/manager/bulk-invite";
        readonly MEMBERS: "/manager/members";
        readonly ACTIVITY: "/manager/activity";
    };
    readonly USER: {
        readonly PROFILE: "/user/profile";
        readonly CHANGE_PASSWORD: "/user/change-password";
    };
};
export declare const MANAGER_ROUTES: {
    readonly INVITE: "/manager/invite";
    readonly BULK_INVITE: "/manager/bulk-invite";
    readonly MEMBERS: "/manager/members";
    readonly ACTIVITY: "/manager/activity";
};
export declare const USER_ROUTES: {
    readonly PROFILE: "/user/profile";
    readonly CHANGE_PASSWORD: "/user/change-password";
};
export declare const ADMIN_ROUTES: {
    readonly ORGANIZATIONS: "/admin/organizations";
    readonly USERS: "/admin/users";
    readonly REPORTS: "/admin/reports";
};
export declare const AUTH_ROUTES: {
    readonly LOGIN: "/auth/login";
    readonly REGISTER: "/auth/register";
    readonly VERIFY_OTP: "/auth/verify-otp";
    readonly RESET_PASSWORD: "/auth/reset-password";
    readonly COMPLETE_RESET: "/auth/complete-reset";
    readonly REFRESH: "/auth/refresh";
    readonly RESET_PASSWORD_REQUEST: "/auth/reset-password-request";
    readonly VERIFY_EMAIL: "/auth/verify-email";
    readonly REGISTER_MANAGER: "/auth/register-manager";
    readonly SEND_OTP: "/auth/send-otp";
    readonly COMPLETE_SIGNUP: "/auth/complete-signup";
    readonly INVITE_MEMBER: "/auth/invite-member";
    readonly ACCEPT_INVITE: "/auth/accept-invite";
};
//# sourceMappingURL=constants.d.ts.map