import { Plan } from "../../domain/entities/Plan";

export interface PlanDTO {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  features: string[];
  duration?: number;
  type: string;
  isActive: boolean;
  limits: {
    projects: number;
    members: number;
    storage?: number;
    messages?: number;
    sprints?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export function toPlanDTO(plan: Plan): PlanDTO {
  const safeDate = (date: Date | string | number | undefined) =>
    date instanceof Date && !isNaN(date.getTime())
      ? date
      : new Date(date || Date.now());

  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    price: plan.price,
    currency: plan.currency,
    features: [...(plan.features || [])],
    duration: plan.duration,
    type: plan.type,
    isActive: plan.isActive,
    limits: {
      projects: plan.limits?.projects || 0,
      members: plan.limits?.members || 0,
      storage: plan.limits?.storage || 0,
      messages: plan.limits?.messages || 0,
      sprints: plan.limits?.sprints || 0,
    },
    createdAt: safeDate(plan.createdAt).toISOString(),
    updatedAt: safeDate(plan.updatedAt).toISOString(),
  };
}
