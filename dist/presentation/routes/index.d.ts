import express from "express";
/**
 * Route
 */
export declare class RouteFactory {
    private readonly _authController;
    private readonly _adminController;
    private readonly _userController;
    private readonly _managerController;
    constructor();
    /**
     * Create authentication routes
     * @returns Express Router with auth routes
     */
    createAuthRoutes(): express.Router;
    /**
     * Create manager routes (protected: ORG_MANAGER)
     */
    createManagerRoutes(): express.Router;
    /**
     * Create admin routes
     * @returns Express Router with admin routes
     */
    createAdminRoutes(): express.Router;
    /**
     * Create organization routes (for regular users)
     * @returns Express Router with organization routes
     */
    createOrganizationRoutes(): express.Router;
    /**
     * Create project routes
     * @returns Express Router with project routes
     */
    createProjectRoutes(): express.Router;
    /**
     * Create user routes
     * @returns Express Router with user routes
     */
    createUserRoutes(): express.Router;
    /**
     * Create all routes and return them as an object
     * @returns Object containing all route routers
     */
    createAllRoutes(): {
        auth: express.Router;
        admin: express.Router;
        organizations: express.Router;
        projects: express.Router;
        user: express.Router;
        manager: express.Router;
    };
}
/**
 * Factory function to create routes with dependency injection
 * @returns Object containing all route routers
 */
export declare function createRoutes(): {
    auth: express.Router;
    admin: express.Router;
    organizations: express.Router;
    projects: express.Router;
    user: express.Router;
    manager: express.Router;
};
//# sourceMappingURL=index.d.ts.map