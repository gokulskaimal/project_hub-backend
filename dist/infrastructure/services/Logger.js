"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const inversify_1 = require("inversify");
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
let Logger = class Logger {
    constructor() {
        this._logger = this._createLogger();
    }
    /**
     * Log info message
     * @param message - Log message
     * @param meta - Additional metadata (optional)
     */
    info(message, meta) {
        this._logger.info(message, meta);
    }
    /**
     * Log error message
     * @param message - Error message
     * @param error - Error object (optional)
     * @param meta - Additional metadata (optional)
     */
    error(message, error, meta) {
        const logData = {
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
    warn(message, meta) {
        this._logger.warn(message, meta);
    }
    /**
     * Log debug message
     * @param message - Debug message
     * @param meta - Additional metadata (optional)
     */
    debug(message, meta) {
        this._logger.debug(message, meta);
    }
    /**
     * Create and configure Winston logger instance
     * @returns Configured Winston logger
     */
    _createLogger() {
        const logDir = path_1.default.join(__dirname, "../../logs");
        const maxAge = process.env.LOG_MAX_AGE || "14d";
        const maxSize = process.env.LOG_MAX_SIZE || "20m";
        const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json(), winston_1.default.format.errors({ stack: true }));
        const logger = winston_1.default.createLogger({
            level: process.env.LOG_LEVEL || "info",
            format: logFormat,
            transports: [
                new winston_daily_rotate_file_1.default({
                    filename: path_1.default.join(logDir, "error-%DATE%.log"),
                    datePattern: "YYYY-MM-DD",
                    zippedArchive: true,
                    maxSize: maxSize,
                    maxFiles: maxAge,
                    level: "error",
                }),
                new winston_daily_rotate_file_1.default({
                    filename: path_1.default.join(logDir, "combined-%DATE%.log"),
                    datePattern: "YYYY-MM-DD",
                    zippedArchive: true,
                    maxSize: maxSize,
                    maxFiles: maxAge,
                }),
            ],
        });
        // Add console transport for non-production environments
        if (process.env.NODE_ENV !== "production") {
            logger.add(new winston_1.default.transports.Console({
                format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
            }));
        }
        return logger;
    }
};
exports.Logger = Logger;
exports.Logger = Logger = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], Logger);
exports.default = new Logger();
//# sourceMappingURL=Logger.js.map