export declare const API_ROUTES: {
    readonly AUTH: {
        readonly LOGIN: "/auth/login";
        readonly REGISTER: "/auth/register";
        readonly VERIFY_OTP: "/auth/verify-otp";
        readonly RESET_PASSWORD: "/auth/reset-password";
        readonly COMPLETE_RESET: "/auth/complete-reset";
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
export declare const MESSAGES: {
    readonly AUTH: {
        readonly LOGIN_SUCCESS: "Login successful";
        readonly INVALID_CREDENTIALS: "Invalid email or password";
        readonly TOKEN_EXPIRED: "Token has expired";
        readonly UNAUTHORIZED: "Unauthorized access";
    };
    readonly USER: {
        readonly CREATED: "User created successfully";
        readonly UPDATED: "User updated successfully";
        readonly DELETED: "User deleted successfully";
        readonly NOT_FOUND: "User not found";
    };
    readonly ORGANIZATION: {
        readonly CREATED: "Organization created successfully";
        readonly UPDATED: "Organization updated successfully";
        readonly DELETED: "Organization deleted successfully";
        readonly NOT_FOUND: "Organization not found";
    };
};
//# sourceMappingURL=constants.d.ts.map