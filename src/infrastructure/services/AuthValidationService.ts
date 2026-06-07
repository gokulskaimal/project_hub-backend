import { injectable } from "inversify";
import { IAuthValidationService } from "../../application/interface/services/IAuthValidationService";
import { ValidationError } from "../../domain/errors/CommonErrors";

@injectable()
export class AuthValidationService implements IAuthValidationService {
  validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email))
      throw new ValidationError("Invalid email format");
  }

  // Replace the validatePassword method (around line 13):
  validatePassword(password: string): void {
    const trimmed = password?.trim();
    if (!trimmed || trimmed.length < 8)
      throw new ValidationError("Password must be at least 8 characters");
    if (trimmed.length > 128)
      throw new ValidationError("Password must be less than 128 characters");
    if (!/[a-z]/.test(trimmed))
      throw new ValidationError("Password must contain a lowercase letter");
    if (!/[A-Z]/.test(trimmed))
      throw new ValidationError("Password must contain an uppercase letter");
    if (!/\d/.test(trimmed))
      throw new ValidationError("Password must contain a number");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(trimmed))
      throw new ValidationError("Password must contain a special character");
  }

  validateOrgName(name: string): void {
    if (!name || name.trim().length < 2)
      throw new ValidationError("Org name too short");
    if (!/^[a-zA-Z0-9\s\-_.&]+$/.test(name))
      throw new ValidationError("Invalid characters in Org name");
    if (!/[a-zA-Z0-9]/.test(name))
      throw new ValidationError(
        "Org name must contain at least one letter or number",
      );
  }

  validateName(firstName: string, lastName: string): void {
    if (!firstName || firstName.length < 2)
      throw new ValidationError("First name too short");
    if (!/[a-zA-Z]/.test(firstName))
      throw new ValidationError("First name must contain at least one letter");

    if (!lastName || lastName.length < 2)
      throw new ValidationError("Last name too short");
    if (!/[a-zA-Z]/.test(lastName))
      throw new ValidationError("Last name must contain at least one letter");
  }

  validateProjectName(name: string): void {
    if (!name || name.trim().length < 3)
      throw new ValidationError("Project name too short (min 3 chars)");
    if (name.length > 50)
      throw new ValidationError("Project name too long (max 50 chars)");
    if (!/[a-zA-Z0-9]/.test(name))
      throw new ValidationError(
        "Project name must contain at least one letter or number",
      );
  }

  validateSprintDates(
    startDate: Date,
    endDate: Date,
    projectStart: Date | null,
    projectEnd: Date,
  ): void {
    if (startDate >= endDate)
      throw new ValidationError("Sprint end date must be after start date");
    if (projectStart && startDate < projectStart)
      throw new ValidationError(
        "Sprint start date is before project start date",
      );
    if (endDate > projectEnd)
      throw new ValidationError("Sprint end date is after project end date");
  }
}
