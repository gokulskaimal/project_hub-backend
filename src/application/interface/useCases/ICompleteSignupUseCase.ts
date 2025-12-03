import { User } from "../../../domain/entities/User";
export interface ICompleteSignupUseCase {
  /**
   * Complete user signup after email verification
   */
  execute(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    additionalData?: Record<string, unknown>,
  ): Promise<{
    user: Partial<User>;
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  }>;

  /**
   * Validate signup data
   */
  validateSignupData(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<boolean>;
}
