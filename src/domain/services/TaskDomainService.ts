import { injectable } from "inversify";
import { Task } from "../entities/Task";
import { User } from "../entities/User";
import { UserRole } from "../enums/UserRole";
import { ValidationError } from "../errors/CommonErrors";
import { Sprint } from "../entities/Sprint";
import { Project } from "../entities/Project";
import { ITaskDomainService } from "../interface/services/ITaskDomainService";

@injectable()
export class TaskDomainService implements ITaskDomainService {
  /**
   * Validates if a user can transition a task to a new status.
   */
  public validateStatusTransition(
    task: Task,
    newStatus: string | undefined,
    user: User,
  ): void {
    if (!newStatus || newStatus === task.status) return;

    if (task.status === "DONE") {
      throw new ValidationError("Task is Completed and cannot be modified.");
    }

    const isManager =
      user.role === UserRole.ORG_MANAGER || user.role === UserRole.SUPER_ADMIN;

    if (!isManager) {
      if (task.assignedTo && task.assignedTo !== user.id) {
        throw new ValidationError(
          "Access Denied: You are only authorized to update tasks assigned to you.",
        );
      }
      if (newStatus === "DONE") {
        throw new ValidationError("Only Managers can mark a task as Done.");
      }

      if (task.status === "REVIEW" && newStatus !== "IN_PROGRESS") {
        throw new ValidationError(
          "Task is under Review. Only Managers can finalize or revert to Todo.",
        );
      }

      if (task.status === "IN_PROGRESS" && newStatus === "TODO") {
        throw new ValidationError(
          "Tasks currently In Progress cannot be moved back to Todo.",
        );
      }
    }
  }

  /**
   * Validates if a due date is within the project or sprint bounds.
   */
  public validateDueDate(
    dueDate: Date,
    sprint?: Sprint | null,
    project?: Project | null,
  ): void {
    if (sprint && sprint.startDate && sprint.endDate) {
      const sprintStart = new Date(sprint.startDate);
      const sprintEnd = new Date(sprint.endDate);
      if (dueDate < sprintStart || dueDate > sprintEnd) {
        throw new ValidationError(
          "Task due date must be within the assigned Sprint's start and end dates.",
        );
      }
    } else if (project) {
      const projectEnd = new Date(project.endDate);
      const projectStart = project.startDate
        ? new Date(project.startDate)
        : null;
      if (projectStart && dueDate < projectStart) {
        throw new ValidationError(
          "Task due date cannot be before Project start date.",
        );
      }
      if (dueDate > projectEnd) {
        throw new ValidationError(
          "Task due date cannot be after Project end date.",
        );
      }
    }
  }

  /**
   * Calculates the capacity of a sprint based on project settings.
   */
  public calculateSprintCapacity(
    sprint: Sprint,
    projectTasksPerWeek: number = 25,
  ): number {
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    const ms = end.getTime() - start.getTime();
    const weeks = Math.max(1, Math.ceil(ms / (7 * 24 * 60 * 60 * 1000)));
    return projectTasksPerWeek * weeks;
  }

  public validateAssignmentToSprint(task: Task): void {
    if (task.type === "STORY" && (!task.storyPoints || task.storyPoints <= 0)) {
      throw new ValidationError(
        "Scrum Rule Violation: User Stories must be estimated with Story Points before entering a Sprint.",
      );
    }
  }

  public validateDefinitionOfDone(task: Task): void {
    const isAssigned =
      !!task.assignedTo && String(task.assignedTo).trim() !== "";
    if (!isAssigned) {
      throw new ValidationError(
        "Scrum Rule Violation: Task must be assigned to a user before reaching Definition of Done.",
      );
    }
  }
}
