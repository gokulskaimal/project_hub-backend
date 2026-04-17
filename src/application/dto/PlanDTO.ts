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
  };
  createdAt: string;
  updatedAt: string;
}

export function toPlanDTO(plan: Plan): PlanDTO {
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    price: plan.price,
    currency: plan.currency,
    features: [...plan.features],
    duration: plan.duration,
    type: plan.type,
    isActive: plan.isActive,
    limits: { ...plan.limits },
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  };
}
