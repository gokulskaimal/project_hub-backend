import { SocketServer } from "./presentation/socket/SocketServer";
import { ISocketService } from "./infrastructure/interface/services/ISocketService";
import { SocketService } from "./infrastructure/services/SocketService";
import "reflect-metadata";
import "dotenv/config";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { StatusCodes } from "./infrastructure/config/statusCodes.enum";

// Import DI Container
import { diContainer, container } from "./infrastructure/container/Container";
import { TYPES } from "./infrastructure/container/types";
import { ILogger } from "./infrastructure/interface/services/ILogger";

// Import Route Factory
import { createRoutes } from "./presentation/routes/index";

// Import middleware
import {
  errorHandler,
  notFoundHandler,
} from "./presentation/middleware/ErrorMiddleware"; // Correct path to robust handlers
import { IBootstrapService } from "./infrastructure/interface/services/IBootstrapService";

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
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: {
      error: "Too many requests from this IP, please try again later.",
      retryAfter: "15 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Stricter rate limiter for Auth routes (Login, Register, etc.)
  const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 15, // Limit each IP to 15 login attempts per minute
    message: {
      success: false,
      error: {
        code: "AUTH_RATE_LIMIT_EXCEEDED",
        message: "Too many attempts, please try again later.",
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply rate limiting to API routes
  app.use("/api/auth", authLimiter);
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

  app.use((req, res, next) => {
    // Determine limit based on path
    // Webhooks often need larger limits (e.g. Stripe, Razorpay)
    const limit = req.path.startsWith("/api/webhooks") ? "10mb" : "100kb";
    express.json({ limit })(req, res, next);
  });

  app.use((req, res, next) => {
    const limit = req.path.startsWith("/api/webhooks") ? "10mb" : "100kb";
    express.urlencoded({ extended: true, limit })(req, res, next);
  });

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

  // Mount routes
  // Public / Mixed Routes (Must come before catch-all protected routes)
  app.use("/api", routes.auth);
  app.use("/api/plans", routes.plans);
  app.use("/api/webhooks", routes.webhooks);

  // Specific Protected Routes
  app.use("/api", routes.manager);
  app.use("/api", routes.admin);
  app.use("/api/organization", routes.organizations);
  app.use("/api/projects", routes.projects);
  app.use("/api/payments", routes.payments);

  // Generic User Routes (Contains global auth middleware for /api/*)
  // Must be after all other /api routes that might need to be public
  app.use("/api", routes.user);
  app.use("/api/notifications", routes.notifications);

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

    // 5. Create HTTP Server explicitly to share with Socket.IO
    const httpServer = http.createServer(app);

    // 6. Initialize Socket.IO with the HTTP Server BEFORE listening (or after, but same instance)
    try {
      const socketServer = diContainer.get<SocketServer>(TYPES.SocketServer);
      const io = socketServer.initialize(httpServer, [
        process.env.FRONTEND_URL || "http://localhost:3000",
      ]);

      const socketService = diContainer.get<ISocketService>(
        TYPES.ISocketService,
      ) as SocketService;
      socketService.setIO(io);
      logger.info("Socket is Connected");
    } catch (err) {
      logger.error("Socket connection error", err as Error);
    }

    // 7. Listen using the HTTP Server, not app.listen
    httpServer.listen(port, () => {
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
