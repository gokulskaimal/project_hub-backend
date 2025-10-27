/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ICompleteSignupUseCase {
  /**
   * Complete user signup after email verification
   */
  execute(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    additionalData?: Record<string, any>,
  ): Promise<{
    user: any;
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
