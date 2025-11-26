import { UserDTO } from "../../../application/dto/UserDTO";

export interface IValidateTokenUseCase {
  execute(token: string): Promise<UserDTO>;
}
