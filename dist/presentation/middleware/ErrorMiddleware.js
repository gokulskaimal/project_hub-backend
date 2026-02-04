"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const Logger_1 = __importDefault(require("../../infrastructure/services/Logger"));
const statusCodes_enum_1 = require("../../infrastructure/config/statusCodes.enum");
const common_constants_1 = require("../../infrastructure/config/common.constants");
const AppError_1 = require("../../domain/errors/AppError");
const CommonErrors_1 = require("../../domain/errors/CommonErrors");
const AuthErrors_1 = require("../../domain/errors/AuthErrors");
function notFoundHandler(_req, res) {
    res.status(statusCodes_enum_1.StatusCodes.NOT_FOUND).json({
        success: false,
        error: {
            code: "NOT_FOUND",
            message: common_constants_1.COMMON_MESSAGES.NOT_FOUND,
        },
    });
}
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
exports.asyncHandler = asyncHandler;
function errorHandler(err, req, res, _next) {
    // 1. Default fallback
    let status = statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR;
    let message = common_constants_1.COMMON_MESSAGES.SERVER_ERROR;
    let code = "INTERNAL_ERROR";
    // 2. Map Domain Errors to HTTP Statuses
    if (err instanceof AppError_1.AppError || err.code?.startsWith("AUTH_") || err.code?.startsWith("COMMON_")) {
        code = err.code || "INTERNAL_ERROR";
        message = err.message;
        // Use name or code to check type if instanceof failed
        const errorType = err.constructor.name;
        const errCode = err.code;
        if (err instanceof CommonErrors_1.EntityNotFoundError || errCode === "COMMON_NOT_FOUND") {
            status = statusCodes_enum_1.StatusCodes.NOT_FOUND;
        }
        else if (err instanceof CommonErrors_1.ValidationError || errCode === "COMMON_VALIDATION_ERROR") {
            status = statusCodes_enum_1.StatusCodes.BAD_REQUEST;
        }
        else if (err instanceof CommonErrors_1.ConflictError || errCode === "COMMON_CONFLICT") {
            status = statusCodes_enum_1.StatusCodes.CONFLICT;
        }
        else if (err instanceof AuthErrors_1.InvalidCredentialsError ||
            err instanceof AuthErrors_1.InvalidTokenError ||
            err instanceof AuthErrors_1.TokenExpiredError ||
            errCode === "AUTH_INVALID_CREDENTIALS" ||
            errCode === "AUTH_TOKEN_EXPIRED") {
            status = statusCodes_enum_1.StatusCodes.UNAUTHORIZED;
        }
        else if (err instanceof AuthErrors_1.AccountSuspendedError ||
            err instanceof AuthErrors_1.EmailNotVerifiedError ||
            err instanceof AuthErrors_1.OrganizationSuspendedError ||
            err instanceof AuthErrors_1.OrganizationNotFoundError ||
            errCode === "AUTH_ACCOUNT_SUSPENDED" ||
            errCode === "AUTH_ORG_NOT_FOUND") {
            status = statusCodes_enum_1.StatusCodes.FORBIDDEN;
        }
        else {
            status = statusCodes_enum_1.StatusCodes.BAD_REQUEST; // Default for other domain errors
        }
    }
    // 3. Handle Legacy HttpErrors (Transition period support)
    else if ("status" in err && typeof err.status === "number") {
        status = err.status;
        message = err.message || common_constants_1.COMMON_MESSAGES.SERVER_ERROR;
        code = err.code || "HTTP_ERROR";
    }
    // 4. Handle Standard Errors
    else if (err instanceof Error) {
        message = err.message;
    }
    // 5. Log Error
    if (status >= 500) {
        Logger_1.default.error("Server Error", err, {
            path: req.path,
            status,
            message,
            code,
            stack: err.stack,
        });
    }
    else {
        Logger_1.default.warn("Request Failed", {
            path: req.path,
            status,
            message,
            code,
        });
    }
    // 6. Send Strict JSON Response
    res.status(status).json({
        success: false,
        error: {
            code,
            message,
        },
    });
}
//# sourceMappingURL=ErrorMiddleware.js.map