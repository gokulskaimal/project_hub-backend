// src/presentation/server.ts - UPDATED WITH DEPENDENCY INJECTION
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

class Server {
  private readonly _app: express.Application;
  private readonly _logger: ILogger;
  private readonly _port: number;

  constructor() {
    this._logger = diContainer.get<ILogger>(TYPES.ILogger);
    this._port = parseInt(process.env.PORT || "4000");
    this._app = express();

    this._setupMiddleware();
    this._setupRoutes();
    this._setupErrorHandling();
  }

  private _setupMiddleware(): void {
    // Security middleware
    this._app.use(
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
    this._app.use("/api", limiter);

    // CORS configuration
    this._app.use(
      cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        maxAge: 86400, // 24 hours
      }),
    );

    // Body parsing middleware
    this._app.use(express.json({ limit: "10mb" }));
    this._app.use(express.urlencoded({ extended: true, limit: "10mb" }));
    this._app.use(cookieParser());

    // Request logging middleware
    this._app.use((req, res, next) => {
      const start = Date.now();

      res.on("finish", () => {
        const duration = Date.now() - start;
        this._logger.info(`${req.method} ${req.originalUrl}`, {
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

  private _setupRoutes(): void {
    // Health check endpoint
    this._app.get("/health", (req, res) => {
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
    this._app.get("/", (req, res) => {
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
    this._app.use("/api/auth", routes.auth);
    this._app.use("/api/admin", routes.admin);
    this._app.use("/api/organizations", routes.organizations);
    this._app.use("/api/projects", routes.projects);
    this._app.use("/api/user", routes.user);
    this._app.use("/api/manager", routes.manager);

    // Container diagnostic endpoint (development only)
    if (process.env.NODE_ENV === "development") {
      this._app.get("/debug/container", (req, res) => {
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

  private _setupErrorHandling(): void {
    // 404 handler for undefined routes
    this._app.use(notFoundHandler);

    // Global error handler
    this._app.use(errorHandler);

    // Process error handlers
    process.on("uncaughtException", (error) => {
      this._logger.error("Uncaught Exception", error);
      process.exit(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
      this._logger.error("Unhandled Rejection at Promise", reason as Error, {
        promise: promise.toString(),
      });
    });

    // Graceful shutdown
    process.on("SIGTERM", () => this._gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => this._gracefulShutdown("SIGINT"));
  }

  /**
   * Connect to MongoDB database
   */
  private async _connectDatabase(): Promise<void> {
    try {
      const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
      if (!mongoUri) {
        this._logger.warn(
          "No MongoDB URI provided. Skipping database connection.",
        );
        return;
      }

      await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4, skip trying IPv6
      });

      this._logger.info("Connected to MongoDB successfully");
    } catch (error) {
      this._logger.error("MongoDB connection error", error as Error);
      // Don't throw error, let server start without DB for now
      this._logger.warn("Starting server without database connection");
    }
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    try {
      await this._connectDatabase();

      // Start HTTP server
      this._app.listen(this._port, () => {
        this._logger.info(
          `Project Hub Server running on: http://localhost:${this._port}`,
        );
        // this._logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        // this._logger.info(`⏰ Started at: ${new Date().toISOString()}`);

        // if (process.env.NODE_ENV === 'development') {
        //     this._logger.info('🛠️ Debug endpoint: http://localhost:' + this._port + '/debug/container');
        // }
      });
    } catch (error) {
      this._logger.error("Failed to start server", error as Error);
      process.exit(1);
    }
  }

  private async _gracefulShutdown(signal: string): Promise<void> {
    this._logger.info(`Received ${signal}. Starting graceful shutdown...`);

    try {
      // Close database connection if it exists
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        this._logger.info("Database connection closed");
      }

      // Close server
      process.exit(0);
    } catch (error) {
      this._logger.error("Error during graceful shutdown", error as Error);
      process.exit(1);
    }
  }

  /**
   * Get Express app instance (for testing)
   */
  public get app(): express.Application {
    return this._app;
  }
}

// Create and start server instance
const server = new Server();
server.start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

// Export for testing
export default server;
