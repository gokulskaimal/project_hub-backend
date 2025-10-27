export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/login",
    SEND_OTP: "/api/auth/send-otp",
    VERIFY_OTP: "/api/auth/verify-otp",
    COMPLETE_SIGNUP: "/api/auth/complete-signup",
    REQUEST_RESET: "/api/auth/request-reset",
    RESET_PASSWORD: "/api/auth/reset-password",
  },
  ADMIN: {
    ORGS: "/api/admin/orgs",
    USERS: "/api/admin/users",
  },
  ORG: {
    INVITES: "/api/organizations/invites",
    MEMBERS: "/api/organizations/members",
  },
} as const;
