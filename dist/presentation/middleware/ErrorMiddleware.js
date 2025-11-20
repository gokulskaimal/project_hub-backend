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
function notFoundHandler(_req, res) {
    res.status(statusCodes_enum_1.StatusCodes.NOT_FOUND).json({ error: common_constants_1.COMMON_MESSAGES.NOT_FOUND });
}
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
exports.asyncHandler = asyncHandler;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function errorHandler(err, req, res, _next) {
    const status = err.status ?? statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR;
    const message = status === statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR
        ? common_constants_1.COMMON_MESSAGES.SERVER_ERROR
        : err.message;
    Logger_1.default.error("Request failed", err, {
        path: req.path,
        status,
        message,
        stack: err.stack,
    });
    res.status(status).json({ error: message, code: err.code });
}
//# sourceMappingURL=ErrorMiddleware.js.map