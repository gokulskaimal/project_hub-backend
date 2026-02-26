"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoutes = createRoutes;
const authRoutes_1 = require("./authRoutes");
const adminRoutes_1 = require("./adminRoutes");
const organizationRoutes_1 = require("./organizationRoutes");
const managerRoutes_1 = require("./managerRoutes");
const userRoutes_1 = require("./userRoutes");
const webhookRoutes_1 = require("./webhookRoutes");
const paymentRoutes_1 = require("./paymentRoutes");
const planRoutes_1 = require("./planRoutes");
const projectRoutes_1 = require("./projectRoutes");
const notificationRoutes_1 = require("./notificationRoutes");
const chatRoutes_1 = require("./chatRoutes");
const uploadRoutes_1 = require("./uploadRoutes");
function createRoutes(container) {
    // 1. Auth Routes
    const authRouter = (0, authRoutes_1.createAuthRoutes)(container);
    // 2. Admin Routes
    const adminRouter = (0, adminRoutes_1.createAdminRoutes)(container);
    // 3. Manager Routes
    const managerRouter = (0, managerRoutes_1.createManagerRoutes)(container);
    // 4. User Routes
    const userRouter = (0, userRoutes_1.createUserRoutes)(container);
    // 5. Organization Routes
    const orgRouter = (0, organizationRoutes_1.createOrganizationRoutes)(container);
    // 6. Project Routes
    const projectRouter = (0, projectRoutes_1.createProjectRoutes)(container);
    // 7. Webhook Routes
    const webhookRouter = (0, webhookRoutes_1.createWebhookRoutes)(container);
    // 8. Payment Routes
    const paymentRouter = (0, paymentRoutes_1.createPaymentRoutes)(container);
    // 9. Plan Routes
    const planRouter = (0, planRoutes_1.createPlanRoutes)(container);
    // 10. Notification Routes
    const notificationRouter = (0, notificationRoutes_1.createNotificationRoutes)(container);
    // 11. Chat Routes
    const chatRouter = (0, chatRoutes_1.createChatRoutes)(container);
    // 12. Upload Routes
    const uploadRouter = (0, uploadRoutes_1.createUploadRoutes)(container);
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
//# sourceMappingURL=index.js.map