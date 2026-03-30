import { injectable, inject } from "inversify";
import mongoose from "mongoose";
import { ILogger } from "../../application/interface/services/ILogger";
import { IHashService } from "../../application/interface/services/IHashService";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { TYPES } from "../container/types";
import { IBootstrapService } from "../../application/interface/services/IBootstrapService";
import { UserRole } from "../../domain/enums/UserRole";
import { User } from "../../domain/entities/User";
import { AppConfig } from "../../config/AppConfig";

@injectable()
export class BootstrapService implements IBootstrapService {
  constructor(
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.IHashService) private readonly _hashService: IHashService,
    @inject(TYPES.AppConfig) private readonly config: AppConfig,
  ) {}

  public async run(): Promise<void> {
    try {
      const email = this.config.bootstrap.adminEmail;
      const password = this.config.bootstrap.adminPassword;

      if (!email || !password) {
        this._logger?.warn?.(
          "SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set; skipping bootstrap",
        );
        return;
      }

      if (mongoose.connection.readyState === 0) {
        this._logger?.warn?.(
          "Database not connected; skipping super admin bootstrap",
        );
        return;
      }

      const existing = await this._userRepo.findByEmail(email);
      const hashed = await this._hashService.hash(password);

      if (!existing) {
        await this._userRepo.create({
          email,
          password: hashed,
          role: UserRole.SUPER_ADMIN,
          emailVerified: true,
          status: "ACTIVE",
          firstName: "Super",
          lastName: "Admin",
          name: "Super Admin",
        } as Partial<User>);
        this._logger.info("Super admin created from environment", { email });
        return;
      }

      if (existing.role !== UserRole.SUPER_ADMIN || !existing.emailVerified) {
        await this._userRepo.updateProfile(existing.id, {
          role: UserRole.SUPER_ADMIN,
          emailVerified: true,
          status: "ACTIVE",
        });
        this._logger.info("Super admin privileges restored");
      }
    } catch (err) {
      this._logger.error("Failed to bootstrap super admin", err as Error);
    }
  }
}

export default BootstrapService;
