import { Sprint } from "../../../domain/entities/Sprint";

export interface IUpdateSprintUseCase {
  execute(
    id: string,
    updateData: Partial<Sprint>,
    requesterId: string,
  ): Promise<Sprint>;
}
