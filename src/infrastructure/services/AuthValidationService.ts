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

  validatePassword(password: string): void {
    if (!password || password.length < 8)
      throw new ValidationError("Password must be at least 8 characters");
    if (!/[A-Z]/.test(password) || !/\d/.test(password)) {
      throw new ValidationError(
        "Password must contain an uppercase letter and a number",
      );
    }
  }

  validateOrgName(name: string): void {
    if (!name || name.trim().length < 2)
      throw new ValidationError("Org name too short");
    if (!/^[a-zA-Z0-9\s\-_.&]+$/.test(name))
      throw new ValidationError("Invalid characters in Org name");
  }

  validateName(firstName: string, lastName: string): void {
    if (!firstName || firstName.length < 2)
      throw new ValidationError("First name too short");
    if (!lastName || lastName.length < 2)
      throw new ValidationError("Last name too short");
  }

  validateProjectName(name: string): void {
    if (!name || name.trim().length < 3)
      throw new ValidationError("Project name too short (min 3 chars)");
    if (name.length > 50)
      throw new ValidationError("Project name too long (max 50 chars)");
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
