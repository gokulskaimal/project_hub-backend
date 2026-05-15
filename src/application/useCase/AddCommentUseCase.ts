import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ITaskRepo } from "../interface/repositories/ITaskRepo";
import { IUserRepo } from "../interface/repositories/IUserRepo";
import { IAddCommentUseCase } from "../interface/useCases/IAddCommentUseCase";
import { ISendMessageUseCase } from "../interface/useCases/ISendMessageUseCase";
import { Task, TaskComment } from "../../domain/entities/Task";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";

@injectable()
export class AddCommentUseCase implements IAddCommentUseCase {
  constructor(
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
    @inject(TYPES.ISendMessageUseCase)
    private _sendMessageUC: ISendMessageUseCase,
  ) {}

  async execute(taskId: string, userId: string, text: string): Promise<Task> {
    const task = await this._taskRepo.findById(taskId);
    if (!task) {
      throw new EntityNotFoundError("Task not found");
    }

    const user = await this._userRepo.findById(userId);
    let userName = "TEAM MEMBER";
    if (user) {
      if (user.firstName || user.lastName) {
        userName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
      } else if (user.name) {
        userName = user.name;
      } else {
        userName = user.email.split("@")[0];
      }
    }

    const comment: TaskComment = {
      userId,
      userName,
      userAvatar: user?.avatar || undefined,
      text,
      createdAt: new Date(),
    };

    const comments = task.comments || [];
    comments.push(comment);
    const updateTask = await this._taskRepo.update(task.id, { comments });

    if (!updateTask) {
      throw new Error("Failed to add comment");
    }

    await this._sendMessageUC.execute(
      userId,
      task.projectId,
      `added a comment : ${text}`,
    );

    return updateTask;
  }
}
