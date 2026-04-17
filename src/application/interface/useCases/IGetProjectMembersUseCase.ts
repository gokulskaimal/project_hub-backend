import { User } from "../../../domain/entities/User";

export interface IGetProjectMembersUseCase {
  execute(projectId: string, requesterId: string): Promise<User[]>;
}
