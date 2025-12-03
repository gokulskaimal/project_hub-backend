export interface IVerifyEmailUseCase {
  execute(token: string): Promise<{ message: string; verified: boolean }>;
}
