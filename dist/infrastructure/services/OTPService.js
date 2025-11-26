"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const inversify_1 = require("inversify");
/**
 * OTP Service Implementation
 * Focuses purely on Generation logic.
 * Storage is handled by UserRepo (MongoDB) or CacheService (Redis) in the Use Layers.
 */
let OtpService = class OtpService {
    /**
     * Generate a random numeric OTP
     * @param length - Length of OTP (default: 6)
     */
    generateOtp(length = 6) {
        if (length < 4 || length > 10) {
            throw new Error("OTP length must be between 4 and 10");
        }
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        const otp = Math.floor(Math.random() * (max - min + 1)) + min;
        return otp.toString();
    }
    /**
     * Generate expiry date for OTP
     * @param minutesFromNow - Minutes from now (default: 10)
     */
    generateExpiry(minutesFromNow = 10) {
        if (minutesFromNow <= 0 || minutesFromNow > 60) {
            throw new Error("OTP expiry must be between 1 and 60 minutes");
        }
        return new Date(Date.now() + minutesFromNow * 60 * 1000);
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = __decorate([
    (0, inversify_1.injectable)()
], OtpService);
//# sourceMappingURL=OTPService.js.map