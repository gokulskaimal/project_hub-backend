import { UserDTO } from "../../dto/UserDTO";

export interface IValidateTokenUseCase {
  execute(token: string): Promise<UserDTO>;
}
