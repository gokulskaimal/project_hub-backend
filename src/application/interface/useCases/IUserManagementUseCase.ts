import { User } from "../../../domain/entities/User";

export interface IUserManagementUseCase {
  updateUser(userId: string, data: Partial<User>): Promise<User>;
  updateUserStatus(userId: string, status: string): Promise<User>;
  deleteUser(userId: string): Promise<void>;
}
