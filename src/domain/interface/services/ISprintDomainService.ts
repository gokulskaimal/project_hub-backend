import { Sprint } from "../../entities/Sprint";

export interface ISprintDomainService {
  validateSprintStart(sprint: Sprint): void;

  validateTimebox(startDate: Date, endDate: Date): void;
}
