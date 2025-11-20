import { UserDTO } from "../../../application/dto/UserDTO";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
};

export type AuthResult = {
  user: UserDTO;
  tokens: AuthTokens;
};
