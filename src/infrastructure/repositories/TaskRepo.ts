import { BaseRepository } from "./BaseRepo";
import { ITaskRepo } from "../../application/interface/repositories/ITaskRepo";
import { Task } from "../../domain/entities/Task";
import { TaskModel, ITaskDoc } from "../models/TaskModel";
import { Model } from "mongoose";
import { DateUtils, TimeFrame } from "../../utils/DateUtils";

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
      dependencies: obj.dependencies || [],
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

  async sumDonePointsByUserInRange(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<number> {
    const result = await this.model.aggregate([
      {
        $match: {
          assignedTo: userId,
          status: "DONE",
          completedAt: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, total: { $sum: "$storyPoints" } } },
    ]);
    return result[0]?.total || 0;
  }

  async sumDonePointsByProjectInRange(
    projectId: string,
    start: Date,
    end: Date,
  ): Promise<number> {
    const result = await this.model.aggregate([
      {
        $match: {
          projectId,
          status: "DONE",
          completedAt: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, total: { $sum: "$storyPoints" } } },
    ]);
    return result[0]?.total || 0;
  }

  async deleteSubtasks(parentId: string): Promise<boolean> {
    await this.model.deleteMany({ parentTaskId: parentId });
    return true;
  }

  async getTopPerformers(
    orgId: string,
    limit: number,
    timeFrame?: TimeFrame,
  ): Promise<
    Array<{
      userId: string;
      name: string;
      storyPoints: number;
      taskCount: number;
    }>
  > {
    const match: Record<string, unknown> = {
      orgId,
      status: "DONE",
      completedAt: { $exists: true },
    };

    if (timeFrame) {
      const { startDate } = DateUtils.getTimeFrameRange(timeFrame);
      match.completedAt = {
        ...(match.completedAt as Record<string, unknown>),
        $gte: startDate,
      };
    }

    const result = await this.model.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$assignedTo",
          storyPoints: { $sum: "$storyPoints" },
          taskCount: { $sum: 1 },
        },
      },
      { $sort: { storyPoints: -1 } },
      { $limit: limit },
      {
        $addFields: {
          assigneeId: { $toObjectId: "$_id" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "assigneeId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          userId: "$_id",
          name: {
            $concat: ["$userDetails.firstName", " ", "$userDetails.lastName"],
          },
          storyPoints: 1,
          taskCount: 1,
        },
      },
    ]);
    return result;
  }

  async getTasksStatusDistribution(
    orgId: string,
    userId?: string,
    timeFrame?: TimeFrame,
  ): Promise<Array<{ status: string; count: number }>> {
    const match: Record<string, unknown> = {};
    if (orgId) match.orgId = orgId;
    if (userId) match.assignedTo = userId;

    if (timeFrame) {
      const { startDate } = DateUtils.getTimeFrameRange(timeFrame);
      match.createdAt = { $gte: startDate };
    }

    const result = await this.model.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } },
    ]);
    return result as Array<{ status: string; count: number }>;
  }

  async getMonthlyVelocity(
    orgId: string,
    userId?: string,
    timeFrame?: TimeFrame,
  ): Promise<Array<{ month: string; points: number }>> {
    const { startDate, groupFormat } = DateUtils.getTimeFrameRange(
      timeFrame || "YEAR",
    );
    const match: Record<string, unknown> = {
      status: "DONE",
      completedAt: { $gte: startDate, $ne: null },
    };
    if (orgId) match.orgId = orgId;
    if (userId) match.assignedTo = userId;

    const result = await this.model.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$completedAt" } },
          points: { $sum: "$storyPoints" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          month: "$_id",
          points: 1,
          _id: 0,
        },
      },
    ]);
    return result;
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
}
