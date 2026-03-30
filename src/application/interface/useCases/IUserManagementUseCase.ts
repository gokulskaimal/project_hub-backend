import { User } from "../../../domain/entities/User";

export interface IUserManagementUseCase {
  updateUser(
    userId: string,
    data: Partial<User>,
    requesterId: string,
  ): Promise<User>;
  updateUserStatus(
    userId: string,
    status: string,
    requesterId: string,
  ): Promise<User>;
  deleteUser(userId: string, requesterId: string): Promise<void>;
}
