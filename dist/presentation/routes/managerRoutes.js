"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorInterceptor = exports.ApiError = void 0;
const HttpStatus_1 = require("../../domain/enums/HttpStatus");
const Logger_1 = require("../../infrastructure/services/Logger");
class ApiError extends Error {
    constructor(statusCode, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
    }
}
exports.ApiError = ApiError;
const errorInterceptor = (err, req, res, _next) => {
    // ✅ USE YOUR LOGGER'S ERROR METHOD CORRECTLY
    try {
        // Create a logger instance since you export both class and default instance
        const logger = new Logger_1.Logger();
        logger.error('API Error occurred', err, {
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString(),
            statusCode: err instanceof ApiError ? err.statusCode : HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            body: req.body,
            params: req.params,
            query: req.query
        });
    }
    catch (logError) {
        // If logging fails, fallback to console
        console.error('Logging failed:', logError);
        console.error('Original error:', {
            message: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method
        });
    }
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            details: err.details,
            timestamp: new Date().toISOString()
        });
    }
    // For non-API errors, don't expose internal details in production
    const isProduction = process.env.NODE_ENV === 'production';
    return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: isProduction ? 'Internal Server Error' : err.message,
        timestamp: new Date().toISOString(),
        ...(isProduction ? {} : { stack: err.stack })
    });
};
exports.errorInterceptor = errorInterceptor;
//# sourceMappingURL=managerRoutes.js.map