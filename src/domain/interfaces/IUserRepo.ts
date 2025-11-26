import { IUserReadRepo } from "./IUserReadRepo";
import { IUserWriteRepo } from "./IUserWriteRepo";
import { IUserOtpRepo } from "./IUserOtpRepo";

/**
 * User Repository Interface
 *
 * @interface IUserRepo
 * @extends {IUserReadRepo}
 * @extends {IUserWriteRepo}
 * @extends {IUserOtpRepo}
 */
export interface IUserRepo
  extends IUserReadRepo,
    IUserWriteRepo,
    IUserOtpRepo {}
