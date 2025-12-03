export const API_PREFIX = "/api";

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    VERIFY_OTP: "/auth/verify-otp",
    RESET_PASSWORD: "/auth/reset-password",
    COMPLETE_RESET: "/auth/complete-reset",
    REFRESH: "/auth/refresh",
    RESET_PASSWORD_REQUEST: "/auth/reset-password-request",
    VERIFY_EMAIL: "/auth/verify-email",
    REGISTER_MANAGER: "/auth/register-manager",
    SEND_OTP: "/auth/send-otp",
    COMPLETE_SIGNUP: "/auth/complete-signup",
    INVITE_MEMBER: "/auth/invite-member",
    ACCEPT_INVITE: "/auth/accept-invite",
    GOOGLE_SIGNIN: "/auth/google-signin",
  },
  ADMIN: {
    ORGANIZATIONS: "/admin/organizations",
    USERS: "/admin/users",
    REPORTS: "/admin/reports",
    PLANS: "/admin/plans",
  },
  MANAGER: {
    INVITE: "/manager/invite",
    BULK_INVITE: "/manager/bulk-invite",
    MEMBERS: "/manager/members",
    ACTIVITY: "/manager/activity",
    INVITATIONS: "/manager/invitations",
  },
  USER: {
    PROFILE: "/user/profile",
    CHANGE_PASSWORD: "/user/change-password",
  },
} as const;

export const MANAGER_ROUTES = API_ROUTES.MANAGER;

export const USER_ROUTES = API_ROUTES.USER;
export const ADMIN_ROUTES = API_ROUTES.ADMIN;
export const AUTH_ROUTES = API_ROUTES.AUTH;
