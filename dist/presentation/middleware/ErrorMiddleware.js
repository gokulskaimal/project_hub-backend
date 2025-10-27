"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const Logger_1 = __importDefault(require("../../infrastructure/services/Logger"));
function notFoundHandler(req, res) {
    res.status(404).json({ error: 'Not Found' });
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function errorHandler(err, req, res, _next) {
    const status = err.status ?? 500;
    const message = status === 500 ? 'Internal Server Error' : err.message;
    Logger_1.default.error('Request failed', err, {
        path: req.path,
        status,
        message,
        stack: err.stack
    });
    res.status(status).json({ error: message, code: err.code });
}
//# sourceMappingURL=ErrorMiddleware.js.map