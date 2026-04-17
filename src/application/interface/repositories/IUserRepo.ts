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
  updateVerificationToken(
    email: string,
    token: string,
    expiry: Date,
  ): Promise<void>;
  findByVerificationToken(token: string): Promise<User | null>;
}
