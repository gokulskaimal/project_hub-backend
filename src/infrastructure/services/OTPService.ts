import { injectable, inject } from "inversify";
import { IOtpService } from "../../application/interface/services/IOtpService";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { TYPES } from "../container/types";

/**
 * OTP Service Implementation
 * Handles creation and verification of OTPs via Repository.
 */
@injectable()
export class OtpService implements IOtpService {
  constructor(@inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo) {}

  generateOtp(length: number = 6): string {
    if (length < 4 || length > 10) {
      throw new Error("OTP length must be between 4 and 10");
    }
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    const otp = Math.floor(Math.random() * (max - min + 1)) + min;
    return otp.toString();
  }

  generateExpiry(minutesFromNow: number = 10): Date {
    if (minutesFromNow <= 0 || minutesFromNow > 60) {
      throw new Error("OTP expiry must be between 1 and 60 minutes");
    }
    return new Date(Date.now() + minutesFromNow * 60 * 1000);
  }

  async storeOtp(email: string, otp: string, expiresAt: Date): Promise<void> {
    await this._userRepo.updateOtp(email, otp, expiresAt);
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const user = await this._userRepo.findByEmailAndOtp(email, otp);
    return !!user;
  }

  async clearOtp(email: string): Promise<void> {
    await this._userRepo.clearOtp(email);
  }

  async getOtp(
    email: string,
  ): Promise<{ otp: string; expiresAt: Date } | null> {
    const user = await this._userRepo.findByEmail(email);
    if (!user || !user.otp || !user.otpExpiry) return null;
    return { otp: user.otp, expiresAt: user.otpExpiry };
  }

  async ensureUserWithOtp(
    email: string,
    otp: string,
    expiresAt: Date,
  ): Promise<void> {
    await this._userRepo.upsertOtpUser(email, {
      otp,
      otpExpiry: expiresAt,
    });
  }

  async cleanExpiredOtps(): Promise<number> {
    return await this._userRepo.cleanExpiredOtps();
  }
}
