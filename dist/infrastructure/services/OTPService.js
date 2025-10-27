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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const inversify_1 = require("inversify");
/**
 * OTP Service Implementation
 * Provides OTP generation, storage, and verification
 *
 * ✅ DEPENDENCY INVERSION PRINCIPLE:
 * - Implements IOtpService interface
 * - Can be easily swapped for Redis or database implementation
 * - Uses @injectable decorator for DI container
 */
let OtpService = class OtpService {
    constructor() {
        // In-memory storage for OTPs (use Redis in production)
        this.otpStore = new Map();
        // Clean up expired OTPs every 5 minutes
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpiredOtps();
        }, 5 * 60 * 1000);
    }
    /**
     * Generate a random OTP
     * @param length - Length of OTP (default: 6)
     * @returns Generated OTP string
     */
    generateOtp(length = 6) {
        if (length < 4 || length > 10) {
            throw new Error('OTP length must be between 4 and 10');
        }
        // Generate random number with specified length
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        const otp = Math.floor(Math.random() * (max - min + 1)) + min;
        return otp.toString();
    }
    /**
     * Generate expiry date for OTP
     * @param minutesFromNow - Minutes from now (default: 10)
     * @returns Expiry date
     */
    generateExpiry(minutesFromNow = 10) {
        if (minutesFromNow <= 0 || minutesFromNow > 60) {
            throw new Error('OTP expiry must be between 1 and 60 minutes');
        }
        return new Date(Date.now() + minutesFromNow * 60 * 1000);
    }
    /**
     * Verify OTP for a given email
     * @param email - User email
     * @param otp - OTP to verify
     * @returns Whether OTP is valid
     */
    verifyOtp(email, otp) {
        if (!email || !otp) {
            return false;
        }
        const record = this.otpStore.get(email.toLowerCase());
        if (!record) {
            return false;
        }
        // Check if OTP is expired
        if (record.expiresAt < Date.now()) {
            this.otpStore.delete(email.toLowerCase());
            return false;
        }
        // Check if OTP matches
        const isValid = record.otp === otp.toString();
        // Remove OTP after verification (one-time use)
        if (isValid) {
            this.otpStore.delete(email.toLowerCase());
        }
        return isValid;
    }
    /**
     * Store OTP for a given email
     * @param email - User email
     * @param otp - OTP to store
     * @param expiresAt - Expiration date
     */
    storeOtp(email, otp, expiresAt) {
        if (!email || !otp) {
            throw new Error('Email and OTP are required');
        }
        if (expiresAt <= new Date()) {
            throw new Error('Expiry date must be in the future');
        }
        this.otpStore.set(email.toLowerCase(), {
            otp: otp.toString(),
            expiresAt: expiresAt.getTime()
        });
    }
    /**
     * Clear OTP for a given email
     * @param email - User email
     */
    clearOtp(email) {
        if (email) {
            this.otpStore.delete(email.toLowerCase());
        }
    }
    /**
     * Check if OTP exists for email (without revealing the OTP)
     * @param email - User email
     * @returns Whether OTP exists and is not expired
     */
    hasValidOtp(email) {
        if (!email)
            return false;
        const record = this.otpStore.get(email.toLowerCase());
        if (!record)
            return false;
        // Check if expired
        if (record.expiresAt < Date.now()) {
            this.otpStore.delete(email.toLowerCase());
            return false;
        }
        return true;
    }
    /**
     * Get OTP expiry time for email
     * @param email - User email
     * @returns Expiry timestamp or null if no OTP
     */
    getOtpExpiry(email) {
        if (!email)
            return null;
        const record = this.otpStore.get(email.toLowerCase());
        if (!record)
            return null;
        return new Date(record.expiresAt);
    }
    /**
     * Generate and store OTP for email
     * @param email - User email
     * @param length - OTP length
     * @param expiryMinutes - Minutes until expiry
     * @returns Generated OTP
     */
    generateAndStoreOtp(email, length = 6, expiryMinutes = 10) {
        const otp = this.generateOtp(length);
        const expiry = this.generateExpiry(expiryMinutes);
        this.storeOtp(email, otp, expiry);
        return otp;
    }
    /**
     * Get statistics about stored OTPs
     * @returns OTP statistics
     */
    getStats() {
        const now = Date.now();
        let expired = 0;
        let valid = 0;
        for (const [, record] of this.otpStore) {
            if (record.expiresAt < now) {
                expired++;
            }
            else {
                valid++;
            }
        }
        return {
            total: this.otpStore.size,
            expired,
            valid
        };
    }
    /**
     * Clean up expired OTPs from memory
     * @returns Number of cleaned up OTPs
     */
    cleanupExpiredOtps() {
        const now = Date.now();
        let cleanedCount = 0;
        for (const [email, record] of this.otpStore) {
            if (record.expiresAt < now) {
                this.otpStore.delete(email);
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            console.log(`🧹 Cleaned up ${cleanedCount} expired OTPs`);
        }
        return cleanedCount;
    }
    /**
     * Clear all OTPs (useful for testing)
     */
    clearAll() {
        this.otpStore.clear();
    }
    /**
     * Destroy service and cleanup intervals
     */
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.clearAll();
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], OtpService);
//# sourceMappingURL=OTPService.js.map