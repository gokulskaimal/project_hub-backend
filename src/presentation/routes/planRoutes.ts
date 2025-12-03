import { Router } from "express";
import { Container } from "inversify";
import { AdminController } from "../controllers/AdminController";
import { TYPES } from "../../infrastructure/container/types";

export function createPlanRoutes(container: Container): Router {
  const router = Router();
  // Reusing AdminController as it holds the Plan logic for now.
  // In a larger app, we'd separate this into a PlanController.
  const controller = container.get<AdminController>(TYPES.AdminController);

  router.get("/", (req, res, next) => controller.getPlans(req, res, next));

  return router;
}
