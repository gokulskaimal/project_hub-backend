import express from 'express';
/**
 * Route Factory using Dependency Injection
 *
 * This factory creates Express routers with controllers resolved from the DI container.
 * It ensures proper dependency injection throughout the application.
 */
export declare class RouteFactory {
    private readonly _authController;
    private readonly _adminController;
    constructor();
    /**
     * Create authentication routes
     * @returns Express Router with auth routes
     */
    createAuthRoutes(): express.Router;
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
     * Create all routes and return them as an object
     * @returns Object containing all route routers
     */
    createAllRoutes(): {
        auth: express.Router;
        admin: express.Router;
        organizations: express.Router;
        projects: express.Router;
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
};
//# sourceMappingURL=index.d.ts.map