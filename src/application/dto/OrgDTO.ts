import {
  Organization,
  OrganizationStatus,
} from "../../domain/entities/Organization";

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
  planName?: string;
  industry?: string;
  size?: string;
  createdAt: string;
  updatedAt?: string;
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
    planName: org.planName,
    industry: org.industry,
    size: org.size,
    createdAt: org.createdAt
      ? org.createdAt.toISOString()
      : new Date().toISOString(),
    updatedAt: org.updatedAt ? org.updatedAt.toISOString() : undefined,
  };
}
