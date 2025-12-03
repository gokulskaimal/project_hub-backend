export interface ILogger {
  /**
   * Log info message
   * @param message - Log message
   * @param meta - Additional metadata (optional)
   */
  info(message: string, meta?: Record<string, unknown>): void;

  /**
   * Log error message
   * @param message - Error message
   * @param error - Error object (optional)
   * @param meta - Additional metadata (optional)
   */
  error(message: string, error?: Error, meta?: Record<string, unknown>): void;

  /**
   * Log warning message
   * @param message - Warning message
   * @param meta - Additional metadata (optional)
   */
  warn(message: string, meta?: Record<string, unknown>): void;

  /**
   * Log debug message
   * @param message - Debug message
   * @param meta - Additional metadata (optional)
   */
  debug(message: string, meta?: Record<string, unknown>): void;
}
