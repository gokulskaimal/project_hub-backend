import { Router } from "express";
import { Container } from "inversify";
import { createAuthRoutes } from "./authRoutes";
import { createAdminRoutes } from "./adminRoutes";
import { createOrganizationRoutes } from "./organizationRoutes";
import { createManagerRoutes } from "./managerRoutes";
import { createUserRoutes } from "./userRoutes";
import { createWebhookRoutes } from "./webhookRoutes";
import { createPaymentRoutes } from "./paymentRoutes";
import { createPlanRoutes } from "./planRoutes";
import { createProjectRoutes } from "./projectRoutes";

export function createRoutes(container: Container): {
  auth: Router;
  admin: Router;
  manager: Router;
  user: Router;
  organizations: Router;
  projects: Router;
  webhooks: Router;
  payments: Router;
  plans: Router;
} {
  // 1. Auth Routes
  const authRouter = createAuthRoutes(container);

  // 2. Admin Routes
  const adminRouter = createAdminRoutes(container);

  // 3. Manager Routes
  const managerRouter = createManagerRoutes(container);

  // 4. User Routes
  const userRouter = createUserRoutes(container);

  // 5. Organization Routes
  const orgRouter = createOrganizationRoutes(container);

  //   const projectRouter = express.Router();
  //   projectRouter.get("/", (_req, res) => {
  //     res.json({ message: "Coming soon" });
  //   });
  const projectRouter = createProjectRoutes(container);

  const webhookRouter = createWebhookRoutes(container);
  const paymentRouter = createPaymentRoutes(container);
  const planRouter = createPlanRoutes(container);

  return {
    auth: authRouter,
    admin: adminRouter,
    manager: managerRouter,
    user: userRouter,
    organizations: orgRouter,
    projects: projectRouter,
    webhooks: webhookRouter,
    payments: paymentRouter,
    plans: planRouter,
  };
}
