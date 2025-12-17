import { Router } from "express";
import { Container } from "inversify";
import { AdminPlanController } from "../controllers/admin/AdminPlanController";
import { TYPES } from "../../infrastructure/container/types";

export function createPlanRoutes(container: Container): Router {
  const router = Router();
  // Using AdminPlanController for plan logic.
  const controller = container.get<AdminPlanController>(TYPES.AdminPlanController);

  router.get("/", (req, res, next) => controller.getPlans(req, res, next));

  return router;
}
