import { Organization, OrganizationStatus } from "../../domain/entities/Organization";

export interface OrgDTO {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  logo?: string;
  website?: string;
  status: OrganizationStatus;
  planId?: string;
  subscriptionStatus?: string;
  maxManagers?: number;
  maxUsers?: number;
  currentUserCount?: number;
  industry?: string;
  size?: string;
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
  features?: string[];
  createdAt: string;
  updatedAt?: string;
  trialEndsAt?: string;
  tags?: string[];
}

export function toOrgDTO(org: Organization): OrgDTO {
  return {
    id: org.id,
    name: org.name,
    displayName: org.displayName,
    description: org.description,
    logo: org.logo,
    website: org.website,
    status: org.status,
    planId: org.planId,
    subscriptionStatus: org.subscriptionStatus,
    maxManagers: org.maxManagers,
    maxUsers: org.maxUsers,
    currentUserCount: org.currentUserCount,
    industry: org.industry,
    size: org.size,
    address: org.address ? { ...org.address } : undefined,
    contact: org.contact ? { ...org.contact } : undefined,
    features: org.features ? [...org.features] : undefined,
    createdAt: org.createdAt.toISOString(),
    updatedAt: org.updatedAt?.toISOString(),
    trialEndsAt: org.trialEndsAt?.toISOString(),
    tags: org.tags ? [...org.tags] : undefined,
  };
}
