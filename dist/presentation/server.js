"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/presentation/server.ts - UPDATED WITH DEPENDENCY INJECTION
require("reflect-metadata");
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Import DI Container
const Container_1 = require("../infrastructure/container/Container");
const types_1 = require("../infrastructure/container/types");
// Import Route Factory (uses DI)
const index_1 = require("./routes/index");
// Import middleware
const ErrorMiddleware_1 = require("./middleware/ErrorMiddleware");
class Server {
    constructor() {
        this._logger = Container_1.diContainer.get(types_1.TYPES.ILogger);
        this._port = parseInt(process.env.PORT || '4000');
        this._app = (0, express_1.default)();
        this._setupMiddleware();
        this._setupRoutes();
        this._setupErrorHandling();
    }
    _setupMiddleware() {
        // Security middleware
        this._app.use((0, helmet_1.default)({
            contentSecurityPolicy: process.env.NODE_ENV === 'production',
            crossOriginEmbedderPolicy: false
        }));
        // Rate limiting
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // Limit each IP to 100 requests per windowMs
            message: {
                error: 'Too many requests from this IP, please try again later.',
                retryAfter: '15 minutes'
            },
            standardHeaders: true,
            legacyHeaders: false,
        });
        this._app.use('/api', limiter);
        // CORS configuration
        this._app.use((0, cors_1.default)({
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
            maxAge: 86400 // 24 hours
        }));
        // Body parsing middleware
        this._app.use(express_1.default.json({ limit: '10mb' }));
        this._app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        this._app.use((0, cookie_parser_1.default)());
        // Request logging middleware
        this._app.use((req, res, next) => {
            const start = Date.now();
            res.on('finish', () => {
                const duration = Date.now() - start;
                this._logger.info(`${req.method} ${req.originalUrl}`, {
                    method: req.method,
                    url: req.originalUrl,
                    statusCode: res.statusCode,
                    duration: `${duration}ms`,
                    userAgent: req.get('User-Agent'),
                    ip: req.ip
                });
            });
            next();
        });
    }
    _setupRoutes() {
        // Health check endpoint
        this._app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || 'development',
                version: '1.0.0',
                dependencyInjection: 'ENABLED'
            });
        });
        // Root endpoint
        this._app.get('/', (req, res) => {
            res.status(200).json({
                message: 'Project Hub API with Dependency Injection',
                version: '1.0.0',
                status: 'running',
                timestamp: new Date().toISOString(),
                endpoints: {
                    health: '/health',
                    auth: '/api/auth',
                    admin: '/api/admin',
                    organizations: '/api/organizations',
                    projects: '/api/projects'
                }
            });
        });
        const routes = (0, index_1.createRoutes)();
        this._app.use('/api/auth', routes.auth);
        this._app.use('/api/admin', routes.admin);
        this._app.use('/api/organizations', routes.organizations);
        this._app.use('/api/projects', routes.projects);
        // Container diagnostic endpoint (development only)
        if (process.env.NODE_ENV === 'development') {
            this._app.get('/debug/container', (req, res) => {
                const types = Object.keys(types_1.TYPES);
                const boundServices = types.filter(type => Container_1.diContainer.isBound(types_1.TYPES[type]));
                res.json({
                    message: 'DI Container Status',
                    totalTypes: types.length,
                    boundServices: boundServices.length,
                    services: boundServices
                });
            });
        }
    }
    _setupErrorHandling() {
        // 404 handler for undefined routes
        this._app.use(ErrorMiddleware_1.notFoundHandler);
        // Global error handler
        this._app.use(ErrorMiddleware_1.errorHandler);
        // Process error handlers
        process.on('uncaughtException', (error) => {
            this._logger.error('Uncaught Exception', error);
            process.exit(1);
        });
        process.on('unhandledRejection', (reason, promise) => {
            this._logger.error('Unhandled Rejection at Promise', reason, {
                promise: promise.toString()
            });
        });
        // Graceful shutdown
        process.on('SIGTERM', () => this._gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => this._gracefulShutdown('SIGINT'));
    }
    /**
     * Connect to MongoDB database
     */
    async _connectDatabase() {
        try {
            const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
            if (!mongoUri) {
                this._logger.warn('No MongoDB URI provided. Skipping database connection.');
                return;
            }
            await mongoose_1.default.connect(mongoUri, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                family: 4 // Use IPv4, skip trying IPv6
            });
            this._logger.info('Connected to MongoDB successfully');
        }
        catch (error) {
            this._logger.error('MongoDB connection error', error);
            // Don't throw error, let server start without DB for now
            this._logger.warn('Starting server without database connection');
        }
    }
    /**
     * Start the server
     */
    async start() {
        try {
            await this._connectDatabase();
            // Start HTTP server
            this._app.listen(this._port, () => {
                this._logger.info('Project Hub Server started successfully!');
                this._logger.info(`Server running on: http://localhost:${this._port}`);
                // this._logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
                // this._logger.info(`⏰ Started at: ${new Date().toISOString()}`);
                // if (process.env.NODE_ENV === 'development') {
                //     this._logger.info('🛠️ Debug endpoint: http://localhost:' + this._port + '/debug/container');
                // }
            });
        }
        catch (error) {
            this._logger.error('Failed to start server', error);
            process.exit(1);
        }
    }
    async _gracefulShutdown(signal) {
        this._logger.info(`Received ${signal}. Starting graceful shutdown...`);
        try {
            // Close database connection if it exists
            if (mongoose_1.default.connection.readyState !== 0) {
                await mongoose_1.default.connection.close();
                this._logger.info('Database connection closed');
            }
            // Close server
            process.exit(0);
        }
        catch (error) {
            this._logger.error('Error during graceful shutdown', error);
            process.exit(1);
        }
    }
    /**
     * Get Express app instance (for testing)
     */
    get app() {
        return this._app;
    }
}
// Create and start server instance
const server = new Server();
server.start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
// Export for testing 
exports.default = server;
//# sourceMappingURL=server.js.map