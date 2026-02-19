import { Task } from "../../../domain/entities/Task";

export interface IToggleTimerUseCase {
  execute(
    taskId: string,
    userId: string,
    action: "start" | "stop",
  ): Promise<Task | null>;
}
