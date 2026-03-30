import { User } from "../../../domain/entities/User";

export interface IUserQueryUseCase {
  listUsers(
    limit: number,
    offset: number,
    requesterId: string,
    search?: string,
    filters?: {
      orgId?: string;
      role?: string;
      status?: string;
    },
  ): Promise<{ users: User[]; total: number }>;

  getUserById(userId: string, requesterId: string): Promise<User | null>;

  getUsersByOrganization(orgId: string, requesterId: string): Promise<User[]>;
}
