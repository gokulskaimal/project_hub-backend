import { injectable } from "inversify";
import { IOtpService } from "../interface/services/IOtpService";

/**
 * OTP Service Implementation
 * Focuses purely on Generation logic.
 * Storage is handled by UserRepo (MongoDB) or CacheService (Redis) in the Use Layers.
 */
@injectable()
export class OtpService implements IOtpService {
  /**
   * Generate a random numeric OTP
   * @param length - Length of OTP (default: 6)
   */
  generateOtp(length: number = 6): string {
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
  generateExpiry(minutesFromNow: number = 10): Date {
    if (minutesFromNow <= 0 || minutesFromNow > 60) {
      throw new Error("OTP expiry must be between 1 and 60 minutes");
    }
    return new Date(Date.now() + minutesFromNow * 60 * 1000);
  }
}
