import { Router } from "express";
import { Container } from "inversify";
export declare function createRoutes(container: Container): {
    auth: Router;
    admin: Router;
    manager: Router;
    user: Router;
    organizations: Router;
    projects: Router;
};
//# sourceMappingURL=index.d.ts.map