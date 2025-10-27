/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ILogger {
  /**
   * Log info message
   * @param message - Log message
   * @param meta - Additional metadata (optional)
   */
  info(message: string, meta?: any): void;

  /**
   * Log error message
   * @param message - Error message
   * @param error - Error object (optional)
   * @param meta - Additional metadata (optional)
   */
  error(message: string, error?: Error, meta?: any): void;

  /**
   * Log warning message
   * @param message - Warning message
   * @param meta - Additional metadata (optional)
   */
  warn(message: string, meta?: any): void;

  /**
   * Log debug message
   * @param message - Debug message
   * @param meta - Additional metadata (optional)
   */
  debug(message: string, meta?: any): void;
}
