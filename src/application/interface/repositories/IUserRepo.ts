import { User } from "../../../domain/entities/User";
import { IUserReadRepo } from "./IUserReadRepo";
import { IUserWriteRepo } from "./IUserWriteRepo";

/**
 * User Repository Interface
 *
 * @interface IUserRepo
 * @extends {IUserReadRepo}
 * @extends {IUserWriteRepo}
 * @extends {IUserOtpRepo}
 */
export interface IUserRepo extends IUserReadRepo, IUserWriteRepo {
  getGlobalStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    pending: number;
    verified: number;
    unverified: number;
    byRole: Record<string, number>;
  }>;
  updateVerificationToken(
    email: string,
    token: string,
    expiry: Date,
  ): Promise<void>;
  findByVerificationToken(token: string): Promise<User | null>;
  getOrgMemberStats(
    orgId: string,
  ): Promise<{ total: number; active: number; inactive: number }>;
}
