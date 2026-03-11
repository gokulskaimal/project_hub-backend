import { BaseRepository } from "./BaseRepo";
import { ITaskRepo } from "../interface/repositories/ITaskRepo";
import { Task } from "../../domain/entities/Task";
import { TaskModel, ITaskDoc } from "../models/TaskModel";
import { Model } from "mongoose";

export class TaskRepo
  extends BaseRepository<Task, ITaskDoc>
  implements ITaskRepo
{
  constructor() {
    super(TaskModel as unknown as Model<ITaskDoc>);
  }

  protected toDomain(doc: ITaskDoc): Task {
    const obj = doc.toObject() as ITaskDoc;
    return {
      id: obj._id.toString(),
      projectId: obj.projectId,
      orgId: obj.orgId,
      taskKey: obj.taskKey,
      title: obj.title,
      description: obj.description,
      status: obj.status,
      priority: obj.priority,
      type: obj.type,
      storyPoints: obj.storyPoints,
      sprintId: obj.sprintId, // Ensure this is mapped!
      sprintAssignedAt: obj.sprintAssignedAt,
      assignedTo: obj.assignedTo,
      dueDate: obj.dueDate,
      timeLogs: obj.timeLogs,
      totalTimeSpent: obj.totalTimeSpent,
      attachments: obj.attachments,
      comments: obj.comments?.map((comment) => {
        const commentId = (comment as { _id?: { toString(): string } })._id;
        return {
          id: commentId?.toString(),
          userId: comment.userId,
          text: comment.text,
          createdAt: comment.createdAt,
        };
      }),
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
      completedAt: obj.completedAt,
      createdBy: obj.createdBy,
    } as Task;
  }

  async findByProject(projectId: string): Promise<Task[]> {
    const docs = await this.model.find({ projectId }).sort({ createdAt: -1 });
    return docs.map((d) => this.toDomain(d));
  }

  async findByAssignee(userId: string): Promise<Task[]> {
    const docs = await this.model
      .find({ assignedTo: userId })
      .sort({ createdAt: -1 })
      .populate("project", "name");
    return docs.map((d) => this.toDomain(d));
  }

  async findByOrganization(orgId: string): Promise<Task[]> {
    const docs = await this.model
      .find({ orgId })
      .sort({ createdAt: -1 })
      .populate("project", "name");
    return docs.map((d) => this.toDomain(d));
  }

  async deleteSubtasks(parentId: string): Promise<boolean> {
    await this.model.deleteMany({ parentTaskId: parentId });
    return true;
  }
}
