import { SocketServer } from "./presentation/socket/SocketServer";
import { ISocketService } from "./application/interface/services/ISocketService";
import { SocketService } from "./infrastructure/services/SocketService";
import "reflect-metadata";
import "dotenv/config";
import { config } from "./config/AppConfig";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { StatusCodes } from "./infrastructure/config/statusCodes.enum";
import { API_ROUTES } from "./infrastructure/config/apiRoutes.constant";

// Import DI Container
import { diContainer, container } from "./infrastructure/container/Container";
import { TYPES } from "./infrastructure/container/types";
import { ILogger } from "./application/interface/services/ILogger";

// Import Route Factory
import { createRoutes } from "./presentation/routes/index";

// Import middleware
import {
  errorHandler,
  notFoundHandler,
} from "./presentation/middleware/ErrorMiddleware"; // Correct path to robust handlers
import { IBootstrapService } from "./application/interface/services/IBootstrapService";

let logger: ILogger;
const port = config.port;

function setupMiddleware(app: express.Application): void {
  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: config.nodeEnv === "production",
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: {
      error: "Too many requests from this IP, please try again later.",
      retryAfter: "15 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 15,
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

  app.use(`/api${API_ROUTES.AUTH.BASE}`, authLimiter);
  app.use("/api", limiter);

  app.use(
    cors({
      origin: config.frontend.url,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      maxAge: 86400,
    }),
  );

  app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
  });

  app.use((req, res, next) => {
    const limit = req.path.startsWith(`/api${API_ROUTES.WEBHOOKS.BASE}`)
      ? "10mb"
      : "100kb";
    express.json({ limit })(req, res, next);
  });

  app.use((req, res, next) => {
    const limit = req.path.startsWith(`/api${API_ROUTES.WEBHOOKS.BASE}`)
      ? "10mb"
      : "100kb";
    express.urlencoded({ extended: true, limit })(req, res, next);
  });

  app.use(cookieParser());

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

function setupRoutes(app: express.Application): void {
  app.get("/health", (req, res) => {
    res.status(StatusCodes.OK).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
      version: "1.0.0",
    });
  });

  // Root
  app.get("/", (req, res) => {
    res.status(StatusCodes.OK).json({
      message: "Project Hub API Running",
      version: "1.0.0",
      status: "running",
    });
  });

  // all routes
  const routes = createRoutes(container);

  // Mount routes
  Object.values(routes).forEach((router) => {
    app.use("/api", router);
  });

  if (config.nodeEnv === "development") {
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
    const mongoUri = config.mongoUri;
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

process.on("uncaughtException", (error) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION! Shutting down...", reason);
  process.exit(1);
});

async function startServer(): Promise<void> {
  try {
    if (!config.mongoUri) {
      throw new Error("FATAL: MONGO_URI is missing.");
    }

    await diContainer.init();

    logger = diContainer.get<ILogger>(TYPES.ILogger);

    const app = express();

    setupMiddleware(app);
    setupRoutes(app);
    setupErrorHandling(app);

    await connectDatabase();

    if (diContainer.isBound(TYPES.IBootstrapService)) {
      const bootstrap = diContainer.get<IBootstrapService>(
        TYPES.IBootstrapService,
      );
      await bootstrap.run();
    }

    const httpServer = http.createServer(app);

    try {
      const socketServer = diContainer.get<SocketServer>(TYPES.SocketServer);
      const io = socketServer.initialize(httpServer, [config.frontend.url]);

      const socketService = diContainer.get<ISocketService>(
        TYPES.ISocketService,
      ) as SocketService;
      socketService.setIO(io);
      logger.info("Socket is Connected");
    } catch (err) {
      logger.error("Socket connection error", err as Error);
    }

    // 7. Listen
    httpServer.listen(port, () => {
      logger.info(`Project Hub Server running on: http://localhost:${port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      httpServer.close(async () => {
        logger.info("HTTP Server closed.");
        try {
          await mongoose.disconnect();
          logger.info("MongoDB Disconnected.");
          await diContainer.dispose();
          logger.info("DI Container disposed.");
        } catch (err) {
          logger.error("Error during resource cleanup", err as Error);
        }
        process.exit(0);
      });

      setTimeout(() => {
        logger.error(
          "Could not close connections in time, forcefully shutting down",
        );
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
