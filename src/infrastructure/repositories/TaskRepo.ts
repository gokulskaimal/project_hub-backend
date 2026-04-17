import { BaseRepository } from "./BaseRepo";
import { ITaskRepo } from "../../application/interface/repositories/ITaskRepo";
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
    const obj = doc.toObject() as Record<string, unknown>;
    const raw =
      (doc as unknown as { _doc: Record<string, unknown> })._doc || {};

    const assignedTo =
      obj.assignedTo || doc.get("assignedTo") || raw.assignedTo || raw.assignee;
    const sprintId = obj.sprintId || doc.get("sprintId") || raw.sprintId;
    const createdBy = obj.createdBy || doc.get("createdBy") || raw.createdBy;
    const projectId = obj.projectId || doc.get("projectId") || raw.projectId;
    const orgId = obj.orgId || doc.get("orgId") || raw.orgId;
    const parentTaskId =
      obj.parentTaskId || doc.get("parentTaskId") || raw.parentTaskId;

    return {
      id: doc._id.toString(),
      projectId: projectId?.toString(),
      orgId: orgId?.toString(),
      taskKey: obj.taskKey,
      title: obj.title,
      description: obj.description,
      status: obj.status,
      priority: obj.priority,
      type: obj.type,
      storyPoints: obj.storyPoints,
      sprintId: sprintId?.toString(),
      sprintAssignedAt: obj.sprintAssignedAt,
      assignedTo: assignedTo?.toString(),
      dueDate: obj.dueDate,
      timeLogs: obj.timeLogs,
      totalTimeSpent: obj.totalTimeSpent,
      attachments: obj.attachments,
      comments: (obj.comments as Array<Record<string, unknown>>)?.map(
        (comment: Record<string, unknown>) => {
          const commentId = (comment as { _id?: { toString(): string } })._id;
          return {
            id: commentId?.toString(),
            userId: comment.userId,
            text: comment.text,
            createdAt: comment.createdAt,
          };
        },
      ),
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
      completedAt: obj.completedAt,
      createdBy: createdBy?.toString(),
      parentTaskId: parentTaskId?.toString(),
      epicId: obj.epicId?.toString(),
      dependencies: obj.dependencies || [],
      acceptanceCriteria: obj.acceptanceCriteria || [],
    } as Task;
  }

  async findByProject(projectId: string): Promise<Task[]> {
    const docs = await this.model.find({ projectId }).sort({ createdAt: -1 });
    return docs.map((d) => this.toDomain(d));
  }

  async findByAssignee(userId: string, orgId?: string): Promise<Task[]> {
    const query: Record<string, unknown> = { assignedTo: userId };
    if (orgId) query.orgId = orgId;

    const docs = await this.model
      .find(query)
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

  async countBySprint(sprintId: string): Promise<number> {
    return this.model.countDocuments({ sprintId });
  }

  async countBySprintAssignedAtRange(
    sprintId: string,
    start: Date,
    end: Date,
  ): Promise<number> {
    return this.model.countDocuments({
      sprintId,
      sprintAssignedAt: { $gte: start, $lte: end },
    });
  }

  async deleteSubtasks(parentId: string): Promise<boolean> {
    await this.model.deleteMany({ parentTaskId: parentId });
    return true;
  }

  async findPaginatedByAssignee(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<Task[]> {
    const docs = await this.model
      .find({ assignedTo: userId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate("project", "name");
    return docs.map((d) => this.toDomain(d));
  }

  async countByAssignee(userId: string): Promise<number> {
    return await this.model.countDocuments({ assignedTo: userId });
  }

  async findPaginatedByOrg(
    orgId: string,
    limit: number,
    offset: number,
  ): Promise<Task[]> {
    const docs = await this.model
      .find({ orgId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate("project", "name");
    return docs.map((d) => this.toDomain(d));
  }

  async countByOrg(orgId: string): Promise<number> {
    return await this.model.countDocuments({ orgId });
  }

  async findPaginatedByProject(
    projectId: string,
    limit: number,
    offset: number,
  ): Promise<Task[]> {
    const docs = await this.model
      .find({ projectId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    return docs.map((d) => this.toDomain(d));
  }

  async countByProject(projectId: string): Promise<number> {
    return await this.model.countDocuments({ projectId });
  }

  async findByParent(parentId: string): Promise<Task[]> {
    const docs = await this.model.find({ parentTaskId: parentId });
    return docs.map((d) => this.toDomain(d));
  }

  async findByEpic(epicId: string): Promise<Task[]> {
    const docs = await this.model.find({ epicId: epicId });
    return docs.map((d) => this.toDomain(d));
  }
}
