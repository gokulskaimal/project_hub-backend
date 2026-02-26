import { Sprint } from "../../../domain/entities/Sprint";

export interface ICreateSprintUseCase {
  execute(data: Partial<Sprint>): Promise<Sprint>;
}
