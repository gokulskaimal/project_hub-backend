import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ITaskRepo } from "../interface/repositories/ITaskRepo";
import { ISendMessageUseCase } from "../interface/useCases/ISendMessageUseCase";
import { Task } from "../../domain/entities/Task";
import { IAddAttachmentUseCase } from "../interface/useCases/IAddAttachmentUseCase";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";

@injectable()
export class AddAttachmentUseCase implements IAddAttachmentUseCase {
  constructor(
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.ISendMessageUseCase)
    private _sendMessageUC: ISendMessageUseCase,
  ) {}

  async execute(
    taskId: string,
    userId: string,
    attachment: { name: string; url: string; size?: number; type?: string },
  ): Promise<Task> {
    const task = await this._taskRepo.findById(taskId);
    if (!task) throw new EntityNotFoundError("Task Not found");

    const attachments = task.attachments || [];
    attachments.push(attachment);

    const updatedTask = await this._taskRepo.update(taskId, { attachments });
    if (!updatedTask) {
      throw new Error("Failed to add attachment");
    }

    await this._sendMessageUC.execute(
      userId,
      task.projectId,
      `added an attachment : ${attachment.name}`,
    );
    return updatedTask;
  }
}
