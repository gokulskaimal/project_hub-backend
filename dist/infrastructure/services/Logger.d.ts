import { ILogger } from "../interface/services/ILogger";
export declare class Logger implements ILogger {
    private readonly _logger;
    constructor();
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
    /**
     * Create and configure Winston logger instance
     * @returns Configured Winston logger
     */
    private _createLogger;
}
declare const _default: Logger;
export default _default;
//# sourceMappingURL=Logger.d.ts.map