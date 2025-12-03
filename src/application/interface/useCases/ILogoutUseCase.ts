export interface ILogoutUseCase {
  execute(refreshToken?: string, userId?: string): Promise<void>;
}
