import { Router } from "express";
import { Container } from "inversify";
import { AdminPlanController } from "../controllers/admin/AdminPlanController";
import { TYPES } from "../../infrastructure/container/types";
import { API_ROUTES } from "../../infrastructure/config/apiRoutes.constant";

export function createPlanRoutes(container: Container): Router {
  const router = Router();
  // Using AdminPlanController for plan logic.
  const controller = container.get<AdminPlanController>(
    TYPES.AdminPlanController,
  );

  // API_ROUTES.PLANS.GET_ALL includes the base path segment /plans
  router.get(API_ROUTES.PLANS.GET_ALL, (req, res, next) =>
    controller.getPlans(req, res, next),
  );

  return router;
}

export default createPlanRoutes;
