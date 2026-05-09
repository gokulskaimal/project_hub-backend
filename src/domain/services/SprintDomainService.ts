import { injectable } from "inversify";
import { Sprint } from "../entities/Sprint";
import { ValidationError } from "../errors/CommonErrors";
import { ISprintDomainService } from "../interface/services/ISprintDomainService";

@injectable()
export class SprintDomainService implements ISprintDomainService {
  public validateSprintStart(sprint: Sprint): void {
    const validInitialStatuses = ["PLANNED", "PLANNING"];
    if (sprint.status === "ACTIVE") return; // Already started, allow updates

    if (!validInitialStatuses.includes(sprint.status)) {
      throw new ValidationError(
        `Sprint must be in a PLANNED or PLANNING state to start. Current status: ${sprint.status}`,
      );
    }

    if (!sprint.goal || sprint.goal.trim() === "") {
      throw new ValidationError(
        "Scrum Rule Violation: Cannot start a Sprint without a well-defined Sprint Goal.",
      );
    }
  }

  public validateTimebox(startDate: Date, endDate: Date): void {
    const msDiff = endDate.getTime() - startDate.getTime();

    const days = msDiff / (1000 * 3600 * 24);

    if (days > 28) {
      throw new ValidationError(
        "Scrum Rule Violation: Sprint duration cannot exceed 28 days (4 weeks).",
      );
    }

    if (days < 1) {
      throw new ValidationError(
        "Scrum Rule Violation: Sprint duration must be at least 1 day.",
      );
    }
  }
}
