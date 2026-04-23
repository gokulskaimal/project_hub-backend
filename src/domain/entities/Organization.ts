export enum OrganizationStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  TRIAL = "TRIAL",
  EXPIRED = "EXPIRED",
}

export interface Organization {
  id: string;

  name: string;

  displayName?: string;

  description?: string;

  logo?: string;

  website?: string;

  planId?: string;

  subscriptionStatus?:
    | "ACTIVE"
    | "INACTIVE"
    | "TRIAL"
    | "EXPIRED"
    | "EXPIRED"
    | "CANCELLED";

  subscriptionStartsAt?: Date;
  subscriptionEndsAt?: Date;

  razorpaySubscriptionId?: string;

  status: OrganizationStatus;

  maxManagers?: number;
  maxUsers?: number;
  currentUserCount?: number;

  industry?: string;
  size?: "STARTUP" | "SMALL" | "MEDIUM" | "LARGE" | "ENTERPRISE";

  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
  };
  billing?: {
    gstin?: string;
    billingEmail?: string;
  };
  settings?: {
    allowInvitations?: boolean;
    requireEmailVerification?: boolean;
    [key: string]: unknown;
  };
  features?: string[];
  timezone?: string;
  locale?: string;

  trialStartsAt?: Date;
  trialEndsAt?: Date;

  lastActivityAt?: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
  deletionReason?: string;

  customFields?: Map<string, unknown>;
  tags?: string[];
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  onboardingStatus?: string;
  integrations?: Record<string, unknown>;
  usage?: Record<string, unknown>;
  metadata?: Record<string, unknown>;

  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  planName?: string;
}
