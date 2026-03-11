import winston from "winston";
import path from "path";
import { injectable } from "inversify";
import { ILogger } from "../interface/services/ILogger";
import DailyRotateFile from "winston-daily-rotate-file";

@injectable()
export class Logger implements ILogger {
  private readonly _logger: winston.Logger;

  constructor() {
    this._logger = this._createLogger();
  }

  /**
   * Helper to format all log payloads consistently
   */
  private _formatPayload(meta?: Record<string, unknown>, error?: Error) {
    const { context, traceId, ...metadata } = meta || {};
    return {
      context: context || "System",
      traceId: traceId || "n/a",
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      error: error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : undefined,
    };
  }

  /**
   * Log info message
   * @param message - Log message
   * @param meta - Additional metadata (optional)
   */
  public info(message: string, meta?: Record<string, unknown>): void {
    this._logger.info(message, this._formatPayload(meta));
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
    this._logger.error(message, this._formatPayload(meta, error));
  }

  /**
   * Log warning message
   * @param message - Warning message
   * @param meta - Additional metadata (optional)
   */
  public warn(message: string, meta?: Record<string, unknown>): void {
    this._logger.warn(message, this._formatPayload(meta));
  }

  /**
   * Log debug message
   * @param message - Debug message
   * @param meta - Additional metadata (optional)
   */
  public debug(message: string, meta?: Record<string, unknown>): void {
    this._logger.debug(message, this._formatPayload(meta));
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

export default new Logger();
