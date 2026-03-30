export interface IAuthValidationService {
  validateEmail(email: string): void;
  validatePassword(password: string): void;
  validateOrgName(name: string): void;
  validateName(firstName: string, lastName: string): void;
  validateProjectName(name: string): void;
  validateSprintDates(
    startDate: Date,
    endDate: Date,
    projectStart: Date | null,
    projectEnd: Date,
  ): void;
}
