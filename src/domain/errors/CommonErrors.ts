import { AppError } from "./AppError";

export class EntityNotFoundError extends AppError {
  readonly code = "ENTITY_NOT_FOUND";

  constructor(entity: string, id?: string) {
    super(id ? `${entity} with ID ${id} not found` : `${entity} not found`);
  }
}

export class ValidationError extends AppError {
  readonly code = "VALIDATION_ERROR";

  constructor(message: string) {
    super(message);
  }
}

export class ConflictError extends AppError {
  readonly code = "CONFLICT_ERROR";

  constructor(message: string) {
    super(message);
  }
}

export class InvalidOperationError extends AppError {
  readonly code = "INVALID_OPERATION";

  constructor(message: string) {
    super(message);
  }
}

export class TooManyRequestsError extends AppError {
  readonly code = "TOO_MANY_REQUESTS";

  constructor(message: string = "Too many requests") {
    super(message);
  }
}

export class QuotaExceededError extends AppError {
  readonly code = "QUOTA_EXCEEDED";

  constructor(message: string) {
    super(message);
  }
}

export class UnauthorizedError extends AppError {
  readonly code = "UNAUTHORIZED";

  constructor(message: string = "Unauthorized access") {
    super(message);
  }
}

export class ForbiddenError extends AppError {
  readonly code = "FORBIDDEN";

  constructor(message: string = "Access forbidden") {
    super(message);
  }
}
