"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/presentation/server.ts - FUNCTIONAL PATTERN WITH UTILITY FUNCTIONS
require("reflect-metadata");
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const statusCodes_enum_1 = require("../infrastructure/config/statusCodes.enum");
// Import DI Container
const Container_1 = require("../infrastructure/container/Container");
const types_1 = require("../infrastructure/container/types");
// Import Route Factory (uses DI)
const index_1 = require("./routes/index");
// Import middleware
const ErrorMiddleware_1 = require("./middleware/ErrorMiddleware");
const UserRole_1 = require("../domain/enums/UserRole");
// Ensure container is initialized (connects cache etc.)
// DI container initialization is moved into startServer to avoid top-level await.
let logger;
const port = parseInt(process.env.PORT || "4000");
// ============================================
// UTILITY FUNCTIONS
// ============================================
function setupMiddleware(app) {
    // Security middleware
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: process.env.NODE_ENV === "production",
        crossOriginEmbedderPolicy: false,
    }));
    // Rate limiting
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: {
            error: "Too many requests from this IP, please try again later.",
            retryAfter: "15 minutes",
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use("/api", limiter);
    // CORS configuration
    app.use((0, cors_1.default)({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        maxAge: 86400, // 24 hours
    }));
    // Body parsing middleware
    app.use(express_1.default.json({ limit: "10mb" }));
    app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
    app.use((0, cookie_parser_1.default)());
    // Request logging middleware
    app.use((req, res, next) => {
        const start = Date.now();
        res.on("finish", () => {
            const duration = Date.now() - start;
            logger.info(`${req.method} ${req.originalUrl}`, {
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode,
                duration: `${duration}ms`,
                userAgent: req.get("User-Agent"),
                ip: req.ip,
            });
        });
        next();
    });
}
/**
 * Setup API routes
 */
function setupRoutes(app) {
    // Health check endpoint
    app.get("/health", (req, res) => {
        res.status(statusCodes_enum_1.StatusCodes.OK).json({
            status: "OK",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || "development",
            version: "1.0.0",
            dependencyInjection: "ENABLED",
        });
    });
    // Root endpoint
    app.get("/", (req, res) => {
        res.status(statusCodes_enum_1.StatusCodes.OK).json({
            message: "Project Hub API with Dependency Injection",
            version: "1.0.0",
            status: "running",
            timestamp: new Date().toISOString(),
            endpoints: {
                health: "/health",
                auth: "/api/auth",
                admin: "/api/admin",
                organizations: "/api/organizations",
                projects: "/api/projects",
            },
        });
    });
    const routes = (0, index_1.createRoutes)();
    app.use("/api/auth", routes.auth);
    app.use("/api/admin", routes.admin);
    app.use("/api/organizations", routes.organizations);
    app.use("/api/projects", routes.projects);
    app.use("/api/user", routes.user);
    app.use("/api/manager", routes.manager);
    // Container diagnostic endpoint (development only)
    if (process.env.NODE_ENV === "development") {
        app.get("/debug/container", (req, res) => {
            const types = Object.keys(types_1.TYPES);
            const boundServices = types.filter((type) => Container_1.diContainer.isBound(types_1.TYPES[type]));
            res.json({
                message: "DI Container Status",
                totalTypes: types.length,
                boundServices: boundServices.length,
                services: boundServices,
            });
        });
    }
}
/**
 * Setup error handling and process signals
 */
function setupErrorHandling(app) {
    // 404 handler for undefined routes
    app.use(ErrorMiddleware_1.notFoundHandler);
    // Global error handler
    app.use(ErrorMiddleware_1.errorHandler);
    // Process error handlers
    process.on("uncaughtException", (error) => {
        logger.error("Uncaught Exception", error);
        process.exit(1);
    });
    process.on("unhandledRejection", (reason, promise) => {
        logger.error("Unhandled Rejection at Promise", reason, {
            promise: promise.toString(),
        });
    });
    // Graceful shutdown
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}
/**
 * Connect to MongoDB database
 */
async function connectDatabase() {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!mongoUri) {
            logger.warn("No MongoDB URI provided. Skipping database connection.");
            return;
        }
        await mongoose_1.default.connect(mongoUri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4, // Use IPv4, skip trying IPv6
        });
        logger.info("Connected to MongoDB successfully");
    }
    catch (error) {
        logger.error("MongoDB connection error", error);
        // Don't throw error, let server start without DB for now
        logger.warn("Starting server without database connection");
    }
}
/**
 * Ensure super admin user exists
 */
async function ensureSuperAdmin() {
    try {
        const email = process.env.SUPER_ADMIN_EMAIL?.trim();
        const password = process.env.SUPER_ADMIN_PASSWORD;
        if (!email || !password) {
            logger.warn("SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set; skipping super admin bootstrap");
            return;
        }
        // If DB isn't connected, skip silently
        if (mongoose_1.default.connection.readyState === 0) {
            logger.warn("Database not connected; skipping super admin bootstrap");
            return;
        }
        const userRepo = Container_1.diContainer.get(types_1.TYPES.IUserRepo);
        const hashService = Container_1.diContainer.get(types_1.TYPES.IHashService);
        const existing = await userRepo.findByEmail(email);
        const hashed = await hashService.hash(password);
        if (!existing) {
            await userRepo.create({
                email,
                password: hashed,
                role: UserRole_1.UserRole.SUPER_ADMIN,
                emailVerified: true,
                status: "ACTIVE",
                firstName: "Super",
                lastName: "Admin",
                name: "Super Admin",
            });
            logger.info("Super admin created from environment", { email });
            return;
        }
        // Ensure role, verification, and update password if different
        const needsRole = (existing.role || "").toString() !== UserRole_1.UserRole.SUPER_ADMIN;
        const needsVerify = !existing.emailVerified;
        // We cannot compare hash easily; set password to env always to guarantee login
        const updates = {
            role: needsRole ? UserRole_1.UserRole.SUPER_ADMIN : existing.role,
            emailVerified: true,
            status: "ACTIVE",
            password: hashed,
        };
        await userRepo.updateProfile(existing.id, updates);
        logger.info("Super admin ensured/updated from environment", { email, updated: { role: needsRole, verified: needsVerify } });
    }
    catch (err) {
        logger.error("Failed to bootstrap super admin", err);
    }
}
/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal) {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    try {
        // Close database connection if it exists
        if (mongoose_1.default.connection.readyState !== 0) {
            await mongoose_1.default.connection.close();
            logger.info("Database connection closed");
        }
        // Close server
        process.exit(0);
    }
    catch (error) {
        logger.error("Error during graceful shutdown", error);
        process.exit(1);
    }
}
/**
 * Start the server
 */
async function startServer() {
    try {
        // Initialize DI container here (avoid top-level await)
        await Container_1.diContainer.init();
        logger = Container_1.diContainer.get(types_1.TYPES.ILogger);
        const app = (0, express_1.default)();
        setupMiddleware(app);
        setupRoutes(app);
        setupErrorHandling(app);
        await connectDatabase();
        await ensureSuperAdmin();
        // Start HTTP server
        app.listen(port, () => {
            logger.info(`Project Hub Server running on: http://localhost:${port}`);
        });
    }
    catch (error) {
        // If logger isn't available, fall back to console
        if (logger) {
            logger.error("Failed to start server", error);
        }
        else {
            console.error("Failed to start server", error);
        }
        process.exit(1);
    }
}
startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map