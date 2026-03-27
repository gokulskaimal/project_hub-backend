import { Task } from "../../entities/Task";
import { User } from "../../entities/User";
import { Sprint } from "../../entities/Sprint";
import { Project } from "../../entities/Project";

export interface ITaskDomainService {
  /**
   * Validates if a user can transition a task to a new status.
   */
  validateStatusTransition(
    task: Task,
    newStatus: string | undefined,
    user: User,
  ): void;

  /**
   * Validates if a due date is within the project or sprint bounds.
   */
  validateDueDate(
    dueDate: Date,
    sprint?: Sprint | null,
    project?: Project | null,
  ): void;

  /**
   * Calculates the capacity of a sprint based on project settings.
   */
  calculateSprintCapacity(sprint: Sprint, projectTasksPerWeek?: number): number;
}
