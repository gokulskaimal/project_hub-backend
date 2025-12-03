import { IOtpService } from "../interface/services/IOtpService";
/**
 * OTP Service Implementation
 * Focuses purely on Generation logic.
 * Storage is handled by UserRepo (MongoDB) or CacheService (Redis) in the Use Layers.
 */
export declare class OtpService implements IOtpService {
    /**
     * Generate a random numeric OTP
     * @param length - Length of OTP (default: 6)
     */
    generateOtp(length?: number): string;
    /**
     * Generate expiry date for OTP
     * @param minutesFromNow - Minutes from now (default: 10)
     */
    generateExpiry(minutesFromNow?: number): Date;
}
//# sourceMappingURL=OTPService.d.ts.map