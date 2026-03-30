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
import { createNotificationRoutes } from "./notificationRoutes";
import { createChatRoutes } from "./chatRoutes";
import { createUploadRoutes } from "./uploadRoutes";

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
  notifications: Router;
  chat: Router;
  upload: Router;
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

  // 6. Project Routes
  const projectRouter = createProjectRoutes(container);

  // 7. Webhook Routes
  const webhookRouter = createWebhookRoutes(container);

  // 8. Payment Routes
  const paymentRouter = createPaymentRoutes(container);

  // 9. Plan Routes
  const planRouter = createPlanRoutes(container);

  // 10. Notification Routes
  const notificationRouter = createNotificationRoutes(container);

  // 11. Chat Routes
  const chatRouter = createChatRoutes(container);

  // 12. Upload Routes
  const uploadRouter = createUploadRoutes(container);

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
    notifications: notificationRouter,
    chat: chatRouter,
    upload: uploadRouter,
  };
}
