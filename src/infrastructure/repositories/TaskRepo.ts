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
    const obj = doc.toObject();
    return {
      id: obj._id.toString(),
      projectId: obj.projectId,
      orgId: obj.orgId,
      title: obj.title,
      description: obj.description,
      status: obj.status,
      priority: obj.priority,
      assignedTo: obj.assignedTo,
      dueDate: obj.dueDate,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    } as Task;
  }

  async findByProject(projectId: string): Promise<Task[]> {
    const docs = await this.model.find({ projectId }).sort({ createdAt: -1 });
    return docs.map((d) => this.toDomain(d));
  }

  async findByAssignee(userId: string): Promise<Task[]> {
    const docs = await this.model
      .find({ assignedTo: userId })
      .sort({ createdAt: -1 });
    return docs.map((d) => this.toDomain(d));
  }
}
