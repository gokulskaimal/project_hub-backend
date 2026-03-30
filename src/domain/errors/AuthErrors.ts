import { AppError } from "./AppError";

export class InvalidCredentialsError extends AppError {
  readonly code = "AUTH_INVALID_CREDENTIALS";

  constructor(message: string = "Invalid email or password") {
    super(message);
  }
}

export class AccountSuspendedError extends AppError {
  readonly code = "AUTH_ACCOUNT_SUSPENDED";

  constructor(message: string = "Account suspended or disabled") {
    super(message);
  }
}

export class EmailNotVerifiedError extends AppError {
  readonly code = "AUTH_EMAIL_NOT_VERIFIED";

  constructor(message: string = "Email not verified") {
    super(message);
  }
}

export class OrganizationNotFoundError extends AppError {
  readonly code = "AUTH_ORG_NOT_FOUND";

  constructor(message: string = "Organization does not exist") {
    super(message);
  }
}

export class OrganizationSuspendedError extends AppError {
  readonly code = "AUTH_ORG_SUSPENDED";

  constructor(message: string = "Organization suspended or disabled") {
    super(message);
  }
}

export class TokenExpiredError extends AppError {
  readonly code = "AUTH_TOKEN_EXPIRED";

  constructor(message: string = "Token has expired") {
    super(message);
  }
}

export class InvalidTokenError extends AppError {
  readonly code = "AUTH_INVALID_TOKEN";

  constructor(message: string = "Invalid token") {
    super(message);
  }
}
