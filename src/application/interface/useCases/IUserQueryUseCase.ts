import { User } from "../../../domain/entities/User";

export interface IUserQueryUseCase {
  listUsers(
    limit: number,
    offset: number,
    search?: string,
    filters?: {
      orgId?: string;
      role?: string;
      status?: string;
    },
  ): Promise<{ users: User[]; total: number }>;

  getUserById(userId: string): Promise<User | null>;

  getUsersByOrganization(orgId: string): Promise<User[]>;
}
