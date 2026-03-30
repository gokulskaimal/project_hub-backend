export const COMMON_MESSAGES = {
  OTP_SENT: "OTP sent successfully",
  OTP_VERIFIED: "OTP verified",
  SIGNUP_COMPLETE: "Signup complete",
  LOGIN_SUCCESS: "Login successful",
  RESET_SENT: "Password reset email sent",
  RESET_SUCCESS: "Password has been reset",
  INVALID_INPUT: "Invalid input",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Not found",
  SERVER_ERROR: "Something went wrong",
  CREATED: "Created",
  UPDATED: "Updated",
  DELETED: "Deleted",
  INVITATION_SENT: "Invitation sent successfully",
  INVALID_CREDENTIALS: "Invalid credentials",
  INVALID_TOKEN: "Invalid token",
  TOKEN_REFRESHED: "Token refreshed successfully",
  EMAIL_VERIFIED: "Email verified",
  ACCEPTED: "Accepted",
  LOGOUT_SUCCESS: "Logout successful",
  INVITATIONS_RETRIEVED: "Invitations retrieved successfully",
  MEMBERS_RETRIEVED: "Members retrieved successfully",
  USER_DELETED: "User deleted successfully",
  GENERAL_ERROR: "Something went wrong",
  REQUIRED_FIELD: "Required field",
  PROFILE_RETRIEVED: "Profile retrieved successfully",
  PROFILE_UPDATED: "Profile updated successfully",
  PASSWORD_CHANGED: "Password changed successfully",
} as const;

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ORG_MANAGER: "ORG_MANAGER",
  TEAM_MEMBER: "TEAM_MEMBER",
} as const;

export const PLAN_DEFAULTS = {
  PROJECT_LIMIT: 1, // Fallback if no specific plan limit is found
} as const;
