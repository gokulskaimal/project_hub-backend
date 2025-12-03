import { AuthResult } from "./types";

export interface IRegisterUseCase {
  execute(email: string, password: string, name?: string): Promise<AuthResult>;
}
