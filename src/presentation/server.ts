/* eslint-disable @typescript-eslint/no-explicit-any */
// src/presentation/server.ts - FUNCTIONAL PATTERN WITH UTILITY FUNCTIONS
import "reflect-metadata";
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { StatusCodes } from "../infrastructure/config/statusCodes.enum";

// Import DI Container
import { diContainer } from "../infrastructure/container/Container";
import { TYPES } from "../infrastructure/container/types";
import { ILogger } from "../domain/interfaces/services/ILogger";

// Import Route Factory (uses DI)
import { createRoutes } from "./routes/index";

// Import middleware
import { errorHandler, notFoundHandler } from "./middleware/ErrorMiddleware";
import { IUserRepo } from "../domain/interfaces/IUserRepo";
import { IHashService } from "../domain/interfaces/services/IHashService";
import { UserRole } from "../domain/enums/UserRole";

// Ensure container is initialized (connects cache etc.)
// DI container initialization is moved into startServer to avoid top-level await.
let logger: ILogger;
const port = parseInt(process.env.PORT || "4000");

// ============================================
// UTILITY FUNCTIONS
// ============================================

function setupMiddleware(app: express.Application): void {
  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === "production",
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Rate limiting
  const limiter = rateLimit({
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
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      maxAge: 86400, // 24 hours
    }),
  );

  // CORS-OP-Policy header for Google OAuth postMessage
  // Allows the Google Sign-In SDK to communicate via postMessage in popup windows
  app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
  });

  // Body parsing middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cookieParser());

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
function setupRoutes(app: express.Application): void {
  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(StatusCodes.OK).json({
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
    res.status(StatusCodes.OK).json({
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

  const routes = createRoutes();
  app.use("/api/auth", routes.auth);
  app.use("/api/admin", routes.admin);
  app.use("/api/organizations", routes.organizations);
  app.use("/api/projects", routes.projects);
  app.use("/api/user", routes.user);
  app.use("/api/manager", routes.manager);

  // Container diagnostic endpoint (development only)
  if (process.env.NODE_ENV === "development") {
    app.get("/debug/container", (req, res) => {
      const types = Object.keys(TYPES);
      const boundServices = types.filter((type) =>
        diContainer.isBound(TYPES[type as keyof typeof TYPES]),
      );

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
function setupErrorHandling(app: express.Application): void {
  // 404 handler for undefined routes
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  // Process error handlers
  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception", error);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at Promise", reason as Error, {
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
async function connectDatabase(): Promise<void> {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      logger.warn("No MongoDB URI provided. Skipping database connection.");
      return;
    }

    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    });

    logger.info("Connected to MongoDB successfully");
  } catch (error) {
    logger.error("MongoDB connection error", error as Error);
    // Don't throw error, let server start without DB for now
    logger.warn("Starting server without database connection");
  }
}

/**
 * Ensure super admin user exists
 */
async function ensureSuperAdmin(): Promise<void> {
  try {
    const email = process.env.SUPER_ADMIN_EMAIL?.trim();
    const password = process.env.SUPER_ADMIN_PASSWORD;
    if (!email || !password) {
      logger.warn(
        "SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set; skipping super admin bootstrap",
      );
      return;
    }

    // If DB isn't connected, skip silently
    if (mongoose.connection.readyState === 0) {
      logger.warn("Database not connected; skipping super admin bootstrap");
      return;
    }

    const userRepo = diContainer.get<IUserRepo>(TYPES.IUserRepo);
    const hashService = diContainer.get<IHashService>(TYPES.IHashService);

    const existing = await userRepo.findByEmail(email);
    const hashed = await hashService.hash(password);

    if (!existing) {
      await userRepo.create({
        email,
        password: hashed,
        role: UserRole.SUPER_ADMIN,
        emailVerified: true,
        status: "ACTIVE",
        firstName: "Super",
        lastName: "Admin",
        name: "Super Admin",
      } as any);
      logger.info("Super admin created from environment", { email });
      return;
    }

    // Ensure role, verification, and update password if different
    const needsRole = (existing.role || "").toString() !== UserRole.SUPER_ADMIN;
    const needsVerify = !existing.emailVerified;
    // We cannot compare hash easily; set password to env always to guarantee login
    const updates: any = {
      role: needsRole ? UserRole.SUPER_ADMIN : existing.role,
      emailVerified: true,
      status: "ACTIVE",
      password: hashed,
    };
    await userRepo.updateProfile(existing.id, updates);
    logger.info("Super admin ensured/updated from environment", {
      email,
      updated: { role: needsRole, verified: needsVerify },
    });
  } catch (err) {
    logger.error("Failed to bootstrap super admin", err as Error);
  }
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  try {
    // Close database connection if it exists
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      logger.info("Database connection closed");
    }

    // Close server
    process.exit(0);
  } catch (error) {
    logger.error("Error during graceful shutdown", error as Error);
    process.exit(1);
  }
}

/**
 * Start the server
 */

async function startServer(): Promise<void> {
  try {
    // Initialize DI container here (avoid top-level await)
    await diContainer.init();
    logger = diContainer.get<ILogger>(TYPES.ILogger);

    const app = express();

    setupMiddleware(app);
    setupRoutes(app);
    setupErrorHandling(app);

    await connectDatabase();
    await ensureSuperAdmin();

    // Start HTTP server
    app.listen(port, () => {
      logger.info(`Project Hub Server running on: http://localhost:${port}`);
    });
  } catch (error) {
    // If logger isn't available, fall back to console
    if (logger) {
      logger.error("Failed to start server", error as Error);
    } else {
      console.error("Failed to start server", error);
    }
    process.exit(1);
  }
}
startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
