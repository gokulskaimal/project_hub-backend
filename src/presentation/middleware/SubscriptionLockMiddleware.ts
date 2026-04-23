import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./types/AuthenticatedRequest";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
import { container } from "../../infrastructure/container/Container";
import { TYPES } from "../../infrastructure/container/types";
import { IPlanRepo } from "../../application/interface/repositories/IPlanRepo";
import { IProjectRepo } from "../../application/interface/repositories/IProjectRepo";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { IOrgRepo } from "../../application/interface/repositories/IOrgRepo";
import { PLAN_DEFAULTS } from "../../infrastructure/config/common.constants";

export async function subscriptionLockMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // We ONLY block requests that modify data. Read requests (GET) are perfectly fine.
  const modifyingMethods = ["POST", "PUT", "PATCH", "DELETE"];
  if (!modifyingMethods.includes(req.method)) {
    return next();
  }

  const userId = req.user?.id;
  const orgId = req.user?.orgId;

  // Super Admins bypass the lock, and users without an Org aren't bound to limits
  if (!userId || !orgId || req.user?.role === "SUPER_ADMIN") {
    return next();
  }

  try {
    const planRepo = container.get<IPlanRepo>(TYPES.IPlanRepo);
    const projectRepo = container.get<IProjectRepo>(TYPES.IProjectRepo);
    const userRepo = container.get<IUserRepo>(TYPES.IUserRepo);
    const orgRepo = container.get<IOrgRepo>(TYPES.IOrgRepo);

    const organization = await orgRepo.findById(orgId);

    // If their subscription is Active, the lock is completely bypassed!
    if (organization && organization.subscriptionStatus === "ACTIVE") {
      return next();
    }

    // Their subscription is EXPIRED or CANCELLED, so we fall back to Free Tier limits
    let maxProjects: number = PLAN_DEFAULTS.PROJECT_LIMIT;
    let maxMembers: number = 5; // Default Free Member Limit

    const freePlans = await planRepo.findAll({ isActive: true });
    // Assuming a free plan has price 0 or is marked as default
    const freePlan = freePlans.find((p) => p.price === 0);

    if (freePlan && freePlan.limits) {
      maxProjects = freePlan.limits.projects;
      maxMembers = freePlan.limits.members;
    }

    // Measure their current active workspace size
    const liveProjects = await projectRepo.countByOrg(orgId);
    const liveMembers = await userRepo.countByOrg(orgId);

    // If they have MORE data than the Free Tier allows, they are OVER QUOTA
    if (liveProjects > maxProjects || liveMembers > maxMembers) {
      res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        error: {
          code: "WORKSPACE_LOCKED",
          message:
            "Your organization is over quota. The workspace is in Read-Only mode until you upgrade your plan or remove excess members/projects.",
        },
      });
      return;
    }

    // If they are expired but under the Free Tier limits, let them continue building for free
    next();
  } catch (error) {
    console.error("[SubscriptionLockMiddleware] Error:", error);
    // On unexpected errors, let traffic through so we don't accidentally block paying customers
    next();
  }
}
