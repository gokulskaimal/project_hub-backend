import winston from "winston";
import path from "path";
import { injectable } from "inversify";
import { ILogger } from "../interface/services/ILogger";
import DailyRotateFile from "winston-daily-rotate-file";

/**
 * Winston Logger Implementation
 * Implements ILogger interface for dependency inversion
 * Can be easily swapped with other logging implementations
 */
@injectable()
export class Logger implements ILogger {
  private readonly _logger: winston.Logger;

  constructor() {
    this._logger = this._createLogger();
  }

  /**
   * Log info message
   * @param message - Log message
   * @param meta - Additional metadata (optional)
   */
  public info(message: string, meta?: Record<string, unknown>): void {
    this._logger.info(message, meta);
  }

  /**
   * Log error message
   * @param message - Error message
   * @param error - Error object (optional)
   * @param meta - Additional metadata (optional)
   */
  public error(
    message: string,
    error?: Error,
    meta?: Record<string, unknown>,
  ): void {
    const logData: Record<string, unknown> = {
      ...(meta || {}),
      error: error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : undefined,
    };

    this._logger.error(message, logData);
  }

  /**
   * Log warning message
   * @param message - Warning message
   * @param meta - Additional metadata (optional)
   */
  public warn(message: string, meta?: Record<string, unknown>): void {
    this._logger.warn(message, meta);
  }

  /**
   * Log debug message
   * @param message - Debug message
   * @param meta - Additional metadata (optional)
   */
  public debug(message: string, meta?: Record<string, unknown>): void {
    this._logger.debug(message, meta);
  }

  /**
   * Create and configure Winston logger instance
   * @returns Configured Winston logger
   */
  private _createLogger(): winston.Logger {
    const logDir = path.join(__dirname, "../../logs");
    const maxAge = process.env.LOG_MAX_AGE || "14d";
    const maxSize = process.env.LOG_MAX_SIZE || "20m";

    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
      winston.format.errors({ stack: true }),
    );

    const logger = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: logFormat,
      transports: [
        new DailyRotateFile({
          filename: path.join(logDir, "error-%DATE%.log"),
          datePattern: "YYYY-MM-DD",
          zippedArchive: true,
          maxSize: maxSize,
          maxFiles: maxAge,
          level: "error",
        }),
        new DailyRotateFile({
          filename: path.join(logDir, "combined-%DATE%.log"),
          datePattern: "YYYY-MM-DD",
          zippedArchive: true,
          maxSize: maxSize,
          maxFiles: maxAge,
        }),
      ],
    });

    // Add console transport for non-production environments
    if (process.env.NODE_ENV !== "production") {
      logger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
      );
    }

    return logger;
  }
}

// Export both the class and default instance for backward compatibility
export default new Logger();
