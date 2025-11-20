/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IUserRepo } from "../../domain/interfaces/IUserRepo";
import { IOrgRepo } from "../../domain/interfaces/IOrgRepo";
import { IInviteSignupUseCase } from "../../domain/interfaces/useCases/IInviteSignupUseCase";
import { ILogger } from "../../domain/interfaces/services/ILogger";
import { IHashService } from "../../domain/interfaces/services/IHashService";
import { UserRole } from "../../domain/enums/UserRole";
import { UserDTO } from "../dto/UserDTO";
import { AuthTokens } from "../../domain/interfaces/useCases/types";
import { User } from "../../domain/entities/User";
import { Organization } from "../../domain/entities/Organization";

/**
 * Invite Signup Use Case - Application Layer
 * Handles signup through invitation flow
 */
@injectable()
export class InviteSignupUseCase implements IInviteSignupUseCase {
  private readonly _userRepo: IUserRepo;
  private readonly _orgRepo: IOrgRepo;
  private readonly _logger: ILogger;
  private readonly _hashService: IHashService;

  constructor(
    @inject(TYPES.IUserRepo) userRepo: IUserRepo,
    @inject(TYPES.IOrgRepo) orgRepo: IOrgRepo,
    @inject(TYPES.ILogger) logger: ILogger,
    @inject(TYPES.IHashService) hashService: IHashService,
  ) {
    this._userRepo = userRepo;
    this._orgRepo = orgRepo;
    this._logger = logger;
    this._hashService = hashService;
  }
  execute(
    inviteToken: string,
    userData: {
      password: string;
      firstName: string;
      lastName: string;
    },
  ): Promise<{
    user: User;
    organization: Organization;
    tokens: AuthTokens;
  }> {
    throw new Error("Method not implemented.");
  }
  getInvitationDetails(token: string): Promise<{
    email: string;
    organizationName: string;
    invitedBy: string;
    expiresAt: Date;
    role?: string;
  }> {
    throw new Error("Method not implemented.");
  }

  /**
   * Sign up user through invitation
   * @param email - User email
   * @param password - User password
   * @param orgId - Organization identifier
   * @param role - User role
   * @returns Created user data
   */
  public async signup(
    email: string,
    password: string,
    orgId: string,
    role: UserRole,
  ): Promise<Partial<User>> {
    this._logger.info("Invite signup attempt", { email, orgId, role });

    try {
      // Business Rule: Validate input
      this._validateInput(email, password, orgId, role);

      // Business Rule: Check if user already exists
      const existingUser = await this._userRepo.findByEmail(email);
      if (existingUser) {
        this._logger.warn("User already exists for invite signup", { email });
        throw new Error("User already exists with this email address");
      }

      // Business Rule: Verify organization exists
      const organization = await this._orgRepo.findById(orgId);
      if (!organization) {
        this._logger.warn("Organization not found for invite signup", {
          orgId,
        });
        throw new Error("Organization not found");
      }

      // Business Rule: Check organization status
      if (
        organization.status === "INACTIVE" ||
        organization.status === "SUSPENDED"
      ) {
        this._logger.warn("Signup attempted for inactive organization", {
          orgId,
          status: organization.status,
        });
        throw new Error("Organization is not currently accepting new members");
      }

      // Business Rule: Validate role permissions
      this._validateRolePermissions(role, organization);

      // Business Rule: Hash password
      const hashedPassword = await this._hashService.hash(password);

      // Create user with invitation details
      const newUser = await this._userRepo.create({
        email,
        password: hashedPassword,
        orgId,
        role,
        emailVerified: false, // Will need to verify via email
        status: "PENDING_VERIFICATION",
        createdAt: new Date(),
      });

      this._logger.info("Invite signup completed successfully", {
        userId: newUser.id,
        email,
        orgId,
        orgName: organization.name,
        role,
      });

      // Return safe user data (exclude sensitive fields)
      const {
        password: _,
        resetPasswordToken,
        resetPasswordExpires,
        otp,
        otpExpiry,
        ...safeUserData
      } = newUser;

      return safeUserData;
    } catch (error) {
      this._logger.error("Invite signup failed", error as Error, {
        email,
        orgId,
        role,
      });
      throw error;
    }
  }

  /**
   * Sign up user with pre-verified email (through invitation token)
   * @param email - User email
   * @param password - User password
   * @param name - User full name
   * @param orgId - Organization identifier
   * @param role - User role
   * @returns Created user data
   */
  public async signupWithVerifiedEmail(
    email: string,
    password: string,
    name: string,
    orgId: string,
    role: UserRole,
  ): Promise<Partial<User>> {
    this._logger.info("Verified invite signup attempt", {
      email,
      orgId,
      role,
      name,
    });

    try {
      // Business Rule: Validate input
      this._validateInputWithName(email, password, name, orgId, role);

      // Business Rule: Check if user already exists
      const existingUser = await this._userRepo.findByEmail(email);
      if (existingUser) {
        this._logger.warn("User already exists for verified invite signup", {
          email,
        });
        throw new Error("User already exists with this email address");
      }

      // Business Rule: Verify organization exists
      const organization = await this._orgRepo.findById(orgId);
      if (!organization) {
        this._logger.warn("Organization not found for verified invite signup", {
          orgId,
        });
        throw new Error("Organization not found");
      }

      // Business Rule: Hash password
      const hashedPassword = await this._hashService.hash(password);

      // Create user with verified email
      const newUser = await this._userRepo.create({
        email,
        name: name.trim(),
        password: hashedPassword,
        orgId,
        role,
        emailVerified: true, // Pre-verified through invitation
        status: "ACTIVE",
        createdAt: new Date(),
      });

      this._logger.info("Verified invite signup completed successfully", {
        userId: newUser.id,
        email,
        name,
        orgId,
        orgName: organization.name,
        role,
      });

      // Return safe user data
      const {
        password: _,
        resetPasswordToken,
        resetPasswordExpires,
        otp,
        otpExpiry,
        ...safeUserData
      } = newUser;

      return safeUserData;
    } catch (error) {
      this._logger.error("Verified invite signup failed", error as Error, {
        email,
        name,
        orgId,
        role,
      });
      throw error;
    }
  }

  /**
   * Validate input parameters
   * @param email - Email to validate
   * @param password - Password to validate
   * @param orgId - Organization ID to validate
   * @param role - Role to validate
   */
  private _validateInput(
    email: string,
    password: string,
    orgId: string,
    role: UserRole,
  ): void {
    if (!email || typeof email !== "string") {
      throw new Error("Email is required");
    }

    if (!password || typeof password !== "string") {
      throw new Error("Password is required");
    }

    if (!orgId || typeof orgId !== "string") {
      throw new Error("Organization ID is required");
    }

    if (!role || !Object.values(UserRole).includes(role)) {
      throw new Error("Valid role is required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Validate password strength
    this._validatePassword(password);
  }

  /**
   * Validate input parameters with name
   * @param email - Email to validate
   * @param password - Password to validate
   * @param name - Name to validate
   * @param orgId - Organization ID to validate
   * @param role - Role to validate
   */
  private _validateInputWithName(
    email: string,
    password: string,
    name: string,
    orgId: string,
    role: UserRole,
  ): void {
    this._validateInput(email, password, orgId, role);

    if (!name || typeof name !== "string") {
      throw new Error("Name is required");
    }

    if (name.trim().length < 2) {
      throw new Error("Name must be at least 2 characters long");
    }

    if (name.trim().length > 100) {
      throw new Error("Name must be less than 100 characters long");
    }
  }

  /**
   * Validate password strength
   * @param password - Password to validate
   */
  private _validatePassword(password: string): void {
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    if (password.length > 128) {
      throw new Error("Password must be less than 128 characters long");
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      throw new Error("Password must contain at least one lowercase letter");
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      throw new Error("Password must contain at least one uppercase letter");
    }

    // Check for at least one number
    if (!/\d/.test(password)) {
      throw new Error("Password must contain at least one number");
    }
  }

  /**
   * Validate role permissions for organization
   * @param role - Role to validate
   * @param organization - Organization context
   */
  private _validateRolePermissions(role: UserRole, organization: any): void {
    // Business Rule: Only certain roles can be assigned through invitation
    const allowedRoles = [UserRole.TEAM_MEMBER, UserRole.ORG_MANAGER];

    if (!allowedRoles.includes(role)) {
      throw new Error(`Role ${role} cannot be assigned through invitation`);
    }

    // Business Rule: Check organization-specific role limits (if applicable)
    if (role === UserRole.ORG_MANAGER && organization.maxManagers) {
      // Could implement manager limit check here
      this._logger.info("Manager role assignment", {
        orgId: organization.id,
        maxManagers: organization.maxManagers,
      });
    }
  }
}
