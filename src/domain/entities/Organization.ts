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
    supportEmail?: string;
  };

  billing?: {
    billingEmail?: string;
    taxId?: string;
    currency?: string;
    paymentMethod?: string;
  };

  settings?: {
    allowSelfRegistration?: boolean;
    requireEmailVerification?: boolean;
    passwordPolicy?: {
      minLength?: number;
      requireUppercase?: boolean;
      requireLowercase?: boolean;
      requireNumbers?: boolean;
      requireSymbols?: boolean;
    };
    sessionTimeout?: number;
  };

  features?: string[];

  timezone?: string;

  locale?: string;

  createdAt: Date;

  updatedAt?: Date;

  createdBy?: string;

  trialStartsAt?: Date;

  trialEndsAt?: Date;

  subscriptionStartsAt?: Date;

  subscriptionEndsAt?: Date;

  lastActivityAt?: Date;

  isDeleted?: boolean;

  deletedAt?: Date;

  deletionReason?: string;

  customFields?: Record<string, unknown>;

  tags?: string[];

  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

  onboardingStatus?: {
    completed: boolean;
    currentStep?: number;
    completedSteps?: number[];
    completedAt?: Date;
  };

  integrations?: {
    [service: string]: {
      enabled: boolean;
      config?: Record<string, unknown>;
      connectedAt?: Date;
    };
  };

  usage?: {
    storageUsed?: number;
    storageLimit?: number;
    apiCallsUsed?: number;
    apiCallsLimit?: number;
    lastResetAt?: Date;
  };

  metadata?: Record<string, unknown>;
}
