import { Router } from "express";
import { Container } from "inversify";
import { ProjectController } from "../controllers/manager/ProjectController";
import { TaskController } from "../controllers/manager/TaskController";
import { TYPES } from "../../infrastructure/container/types";
import { authMiddleware } from "../middleware/AuthMiddleware";

export function createProjectRoutes(container: Container): Router {
  const router = Router();
  const projectCtrl = container.get<ProjectController>(TYPES.ProjectController);
  const taskCtrl = container.get<TaskController>(TYPES.TaskController);

  router.use(authMiddleware);

  // Projects
  router.post("/", (req, res, next) => projectCtrl.createProject(req, res, next));
  router.get("/", (req, res, next) => projectCtrl.getAllProjects(req, res, next));
  router.put("/:id", (req, res, next) => projectCtrl.updateProject(req, res, next));
  router.delete("/:id", (req, res, next) => projectCtrl.deleteProject(req, res, next));

  // Tasks (Nested routes usually better, but keeping flat as per design)
  // Or logically, tasks belong to projects
  router.post("/:projectId/tasks", (req, res, next) => taskCtrl.createTask(req, res, next));
  router.get("/:projectId/tasks", (req, res, next) => taskCtrl.getAllTasks(req, res, next));
  
  // Direct Task Manipulation
  router.put("/tasks/:id", (req, res, next) => taskCtrl.updateTask(req, res, next));
  router.delete("/tasks/:id", (req, res, next) => taskCtrl.deleteTask(req, res, next));

  return router;
}
