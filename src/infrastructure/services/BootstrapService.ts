import { injectable, inject } from "inversify";
import mongoose from "mongoose";
import { ILogger } from "../../domain/interfaces/services/ILogger";
import { IHashService } from "../../domain/interfaces/services/IHashService";
import { IUserRepo } from "../../domain/interfaces/IUserRepo";
import { TYPES } from "../container/types";
import { IBootstrapService } from "../../domain/interfaces/services/IBootstrapService";
import { UserRole } from "../../domain/enums/UserRole";
import { User } from "../../domain/entities/User";

@injectable()
export class BootstrapService implements IBootstrapService {
  constructor(
    @inject(TYPES.ILogger) private readonly logger: ILogger,
    @inject(TYPES.IUserRepo) private readonly userRepo: IUserRepo,
    @inject(TYPES.IHashService) private readonly hashService: IHashService,
  ) {}

  public async run(): Promise<void> {
    try {
      const email = process.env.SUPER_ADMIN_EMAIL?.trim();
      const password = process.env.SUPER_ADMIN_PASSWORD;

      if (!email || !password) {
        this.logger?.warn?.(
          "SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set; skipping bootstrap",
        );
        return;
      }

      if (mongoose.connection.readyState === 0) {
        this.logger?.warn?.(
          "Database not connected; skipping super admin bootstrap",
        );
        return;
      }

      const existing = await this.userRepo.findByEmail(email);
      const hashed = await this.hashService.hash(password);

      if (!existing) {
        await this.userRepo.create({
          email,
          password: hashed,
          role: UserRole.SUPER_ADMIN,
          emailVerified: true,
          status: "ACTIVE",
          firstName: "Super",
          lastName: "Admin",
          name: "Super Admin",
        } as Partial<User>);
        this.logger.info("Super admin created from environment", { email });
        return;
      }

      if (existing.role !== UserRole.SUPER_ADMIN || !existing.emailVerified) {
        await this.userRepo.updateProfile(existing.id, {
          role: UserRole.SUPER_ADMIN,
          emailVerified: true,
          status: "ACTIVE",
        });
        this.logger.info("Super admin privileges restored");
      }
    } catch (err) {
      this.logger.error("Failed to bootstrap super admin", err as Error);
    }
  }
}

export default BootstrapService;
