import express from 'express';
import { Container } from 'inversify';
/**
 * Create all application routes using Dependency Injection
 * @param container - Inversify DI container
 * @returns Express router with all routes
 */
export declare function createRoutes(container: Container): express.Router;
export default createRoutes;
//# sourceMappingURL=adminRoutes.d.ts.map