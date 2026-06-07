import { injectable, inject } from "inversify";
import mongoose from "mongoose";
import { ILogger } from "../../application/interface/services/ILogger";
import { IHashService } from "../../application/interface/services/IHashService";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { TYPES } from "../container/types";
import { IBootstrapService } from "../../application/interface/services/IBootstrapService";
import { IPlanRepo } from "../../application/interface/repositories/IPlanRepo";
import { Plan } from "../../domain/entities/Plan";
import { UserRole } from "../../domain/enums/UserRole";
import { User } from "../../domain/entities/User";
import { AppConfig } from "../../config/AppConfig";
import { IEventSubscriber } from "../../application/interface/services/IEventSubscriber";

@injectable()
export class BootstrapService implements IBootstrapService {
  constructor(
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.IHashService) private readonly _hashService: IHashService,
    @inject(TYPES.AppConfig) private readonly config: AppConfig,
    @inject(TYPES.TaskEventSubscriber)
    private readonly _taskSubscriber: IEventSubscriber,
    @inject(TYPES.ProjectEventSubscriber)
    private readonly _projectSubscriber: IEventSubscriber,
    @inject(TYPES.SprintEventSubscriber)
    private readonly _sprintSubscriber: IEventSubscriber,
    @inject(TYPES.ChatEventSubscriber)
    private readonly _chatSubscriber: IEventSubscriber,
    @inject(TYPES.MeetingEventSubscriber)
    private readonly _meetingSubscriber: IEventSubscriber,
    @inject(TYPES.IPlanRepo) private readonly _planRepo: IPlanRepo,
  ) {}

  public async run(): Promise<void> {
    // Initialize Event Listeners
    this._taskSubscriber.init();
    this._projectSubscriber.init();
    this._sprintSubscriber.init();
    this._chatSubscriber.init();
    this._meetingSubscriber.init();

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

      // Check for Free Plan and seed if missing (including inactive ones so we don't override admin choices)
      const allPlans = await this._planRepo.findAll();
      const hasFreePlan = allPlans.some((p) => p.price === 0);

      if (!hasFreePlan) {
        await this._planRepo.create({
          name: "Free Plan",
          description: "Essential features for small teams",
          price: 0,
          billingCycle: "monthly",
          isActive: true,
          limits: {
            projects: 1,
            members: 5,
            storage: 1024,
          },
          features: ["Basic Task Management", "Up to 5 Members", "1 Project"],
          razorpayPlanId: "free_tier",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as Plan);
        this._logger.info("Free Plan seeded successfully");
      }
    } catch (err) {
      this._logger.error("Failed to bootstrap super admin", err as Error);
    }
  }
}

export default BootstrapService;
