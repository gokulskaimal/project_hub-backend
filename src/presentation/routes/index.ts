import express, { Router } from "express";
import { Container } from "inversify";
import { createAuthRoutes } from "./authRoutes";
import { createAdminRoutes } from "./adminRoutes";
import { createManagerRoutes } from "./managerRoutes";
import { createUserRoutes } from "./userRoutes";

export function createRoutes(container: Container): {
  auth: Router;
  admin: Router;
  manager: Router;
  user: Router;
  organizations: Router;
  projects: Router;
} {
  // 1. Auth Routes
  const authRouter = createAuthRoutes(container);

  // 2. Admin Routes
  const adminRouter = createAdminRoutes(container);

  // 3. Manager Routes
  const managerRouter = createManagerRoutes(container);

  // 4. User Routes
  const userRouter = createUserRoutes(container);

  // 5. Placeholders (Strictly Typed)
  const orgRouter = express.Router();
  orgRouter.get("/", (_req, res) => {
    res.json({ message: "Coming soon" });
  });

  const projectRouter = express.Router();
  projectRouter.get("/", (_req, res) => {
    res.json({ message: "Coming soon" });
  });

  return {
    auth: authRouter,
    admin: adminRouter,
    manager: managerRouter,
    user: userRouter,
    organizations: orgRouter,
    projects: projectRouter,
  };
}
