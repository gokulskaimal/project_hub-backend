import { AuthResult } from "./types";

export interface ILoginUseCase {
  execute(email: string, password: string): Promise<AuthResult>;
}
