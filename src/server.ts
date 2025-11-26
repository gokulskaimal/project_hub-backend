import "reflect-metadata";
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { StatusCodes } from "./infrastructure/config/statusCodes.enum";

// Import DI Container
import { diContainer, container } from "./infrastructure/container/Container";
import { TYPES } from "./infrastructure/container/types";
import { ILogger } from "./domain/interfaces/services/ILogger";

// Import Route Factory
import { createRoutes } from "./presentation/routes/index";

// Import middleware
import { errorHandler, notFoundHandler } from "./utils/asyncHandler"; // Ensure path points to where you put handlers
import { IBootstrapService } from "./domain/interfaces/services/IBootstrapService";

let logger: ILogger;
const port = parseInt(process.env.PORT || "4000");

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
  // Apply rate limiting to API routes only
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
      if (logger) {
        logger.info(`${req.method} ${req.originalUrl}`, {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          userAgent: req.get("User-Agent"),
          ip: req.ip,
        });
      }
    });
    next();
  });
}

/**
 * Setup API routes using the RouteFactory
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
    });
  });

  // Root endpoint
  app.get("/", (req, res) => {
    res.status(StatusCodes.OK).json({
      message: "Project Hub API Running",
      version: "1.0.0",
      status: "running",
    });
  });

  // Generate all routes using the DI container
  const routes = createRoutes(container);

  // Mount routers - ORDER MATTERS!
  // Mount more specific routes first to avoid conflicts
  app.use("/api", routes.auth);
  app.use("/api", routes.manager); // Manager routes MUST come before admin
  app.use("/api", routes.admin);
  app.use("/api/organizations", routes.organizations);
  app.use("/api/projects", routes.projects);
  app.use("/api", routes.user);

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
 * Setup error handling
 */
function setupErrorHandling(app: express.Application): void {
  // 404 handler for undefined routes
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);
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
      family: 4,
    });

    logger.info("Connected to MongoDB successfully");
  } catch (error) {
    logger.error("MongoDB connection error", error as Error);
    logger.warn("Starting server without database connection");
  }
}

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    // 1. Initialize DI container (connects Redis if used)
    await diContainer.init();

    // 2. Get logger instance
    logger = diContainer.get<ILogger>(TYPES.ILogger);

    const app = express();

    // 3. Setup App
    setupMiddleware(app);
    setupRoutes(app);
    setupErrorHandling(app);

    // 4. Connect DB & Bootstrap
    await connectDatabase();
    // Run bootstrap tasks via DI-bound BootstrapService
    if (diContainer.isBound(TYPES.IBootstrapService)) {
      const bootstrap = diContainer.get<IBootstrapService>(
        TYPES.IBootstrapService,
      );
      await bootstrap.run();
    }

    // 5. Listen
    app.listen(port, () => {
      logger.info(`Project Hub Server running on: http://localhost:${port}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Closing resources...`);
      await mongoose.disconnect();
      await diContainer.dispose();
      process.exit(0);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Execute
startServer();
