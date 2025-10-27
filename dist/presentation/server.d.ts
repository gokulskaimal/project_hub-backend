import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
declare class Server {
    private readonly _app;
    private readonly _logger;
    private readonly _port;
    constructor();
    private _setupMiddleware;
    private _setupRoutes;
    private _setupErrorHandling;
    /**
     * Connect to MongoDB database
     */
    private _connectDatabase;
    /**
     * Start the server
     */
    start(): Promise<void>;
    private _gracefulShutdown;
    /**
     * Get Express app instance (for testing)
     */
    get app(): express.Application;
}
declare const server: Server;
export default server;
//# sourceMappingURL=server.d.ts.map