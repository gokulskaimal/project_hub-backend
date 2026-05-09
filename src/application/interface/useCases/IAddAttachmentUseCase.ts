import { Task } from "../../../domain/entities/Task";

export interface IAddAttachmentUseCase {
  execute(
    taskId: string,
    userId: string,
    attachment: { name: string; url: string; size?: number; type?: string },
  ): Promise<Task>;
}
