import { Router } from "express";
import { Container } from "inversify";
import { ProjectController } from "../controllers/manager/ProjectController";
import { TaskController } from "../controllers/manager/TaskController";
import { SprintController } from "../controllers/manager/SprintController";
import { TYPES } from "../../infrastructure/container/types";
import { authMiddleware } from "../middleware/AuthMiddleware";
import { API_ROUTES } from "../../infrastructure/config/apiRoutes.constant";

export function createProjectRoutes(container: Container): Router {
  const router = Router();
  const projectCtrl = container.get<ProjectController>(TYPES.ProjectController);
  const taskCtrl = container.get<TaskController>(TYPES.TaskController);
  const sprintCtrl = container.get<SprintController>(TYPES.SprintController);

  router.use(API_ROUTES.PROJECTS.BASE, authMiddleware);

  // Projects
  router.post(API_ROUTES.PROJECTS.CREATE, (req, res, next) =>
    projectCtrl.createProject(req, res, next),
  );
  router.get(API_ROUTES.PROJECTS.GET_getAll, (req, res, next) =>
    projectCtrl.getAllProjects(req, res, next),
  );
  router.get(API_ROUTES.PROJECTS.GET_MY_PROJECTS, (req, res, next) =>
    projectCtrl.getMyProjects(req, res, next),
  );
  router.get(API_ROUTES.PROJECTS.GET_MY_TASKS, (req, res, next) =>
    taskCtrl.getMemberTasks(req, res, next),
  );

  router.get(API_ROUTES.PROJECTS.GET_BY_ID(":id"), (req, res, next) =>
    projectCtrl.getProjectById(req, res, next),
  );
  router.put(API_ROUTES.PROJECTS.UPDATE(":id"), (req, res, next) =>
    projectCtrl.updateProject(req, res, next),
  );
  router.delete(API_ROUTES.PROJECTS.DELETE(":id"), (req, res, next) =>
    projectCtrl.deleteProject(req, res, next),
  );

  // Tasks
  router.post(API_ROUTES.PROJECTS.TASKS(":projectId"), (req, res, next) =>
    taskCtrl.createTask(req, res, next),
  );
  router.get(API_ROUTES.PROJECTS.TASKS(":projectId"), (req, res, next) =>
    taskCtrl.getAllTasks(req, res, next),
  );

  router.put(API_ROUTES.PROJECTS.TASK_UPDATE(":id"), (req, res, next) =>
    taskCtrl.updateTask(req, res, next),
  );
  router.delete(API_ROUTES.PROJECTS.TASK_DELETE(":id"), (req, res, next) =>
    taskCtrl.deleteTask(req, res, next),
  );
  router.post(API_ROUTES.PROJECTS.TASK_TIMER(":id"), (req, res, next) =>
    taskCtrl.toggleTimer(req, res, next),
  );
  router.get(API_ROUTES.PROJECTS.TASK_HISTORY(":id"), (req, res, next) =>
    taskCtrl.getTaskHistory(req, res, next),
  );

  router.post(
    `${API_ROUTES.PROJECTS.BASE}/tasks/:id/comments`,
    (req, res, next) => taskCtrl.addComment(req, res, next),
  );

  router.post(
    `${API_ROUTES.PROJECTS.BASE}/tasks/:id/attachments`,
    (req, res, next) => taskCtrl.addAttachment(req, res, next),
  );

  // Sprints
  router.post(API_ROUTES.PROJECTS.SPRINT_CREATE, (req, res, next) =>
    sprintCtrl.createSprint(req, res, next),
  );
  router.get(API_ROUTES.PROJECTS.SPRINTS(":projectId"), (req, res, next) =>
    sprintCtrl.getProjectSprints(req, res, next),
  );
  router.put(API_ROUTES.PROJECTS.SPRINT_UPDATE(":id"), (req, res, next) =>
    sprintCtrl.updateSprint(req, res, next),
  );
  router.delete(API_ROUTES.PROJECTS.SPRINT_DELETE(":id"), (req, res, next) =>
    sprintCtrl.deleteSprint(req, res, next),
  );

  return router;
}
