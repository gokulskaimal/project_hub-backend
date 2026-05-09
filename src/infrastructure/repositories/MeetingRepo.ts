import { injectable } from "inversify";
import { IMeetingRepo } from "../../application/interface/repositories/IMeetingRepo";
import { Meeting } from "../../domain/entities/Meeting";
import { IMeetingDoc, MeetingModel } from "../models/MeetingModel";
import { BaseRepository } from "./BaseRepo";

@injectable()
export class MeetingRepo
  extends BaseRepository<Meeting, IMeetingDoc>
  implements IMeetingRepo
{
  constructor() {
    super(MeetingModel);
  }

  protected toDomain(doc: IMeetingDoc): Meeting {
    return {
      id: doc._id.toString(),
      sprintId: doc.sprintId,
      projectId: doc.projectId,
      title: doc.title,
      type: doc.type,
      roomId: doc.roomId,
      scheduledAt: doc.scheduledAt,
      status: doc.status,
      createdAt: doc.createdAt as Date,
      updatedAt: doc.updatedAt as Date,
    };
  }

  async findBySprint(sprintId: string): Promise<Meeting[]> {
    const docs = await MeetingModel.find({
      sprintId,
      isDeleted: { $ne: true },
    });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByRoomId(roomId: string): Promise<Meeting | null> {
    const doc = await MeetingModel.findOne({
      roomId,
      isDeleted: { $ne: true },
    });
    return doc ? this.toDomain(doc) : null;
  }

  async updateStatus(roomId: string, status: string): Promise<Meeting | null> {
    const doc = await MeetingModel.findOneAndUpdate(
      { roomId, isDeleted: { $ne: true } },
      { status },
      { new: true },
    );
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async updateByRoomId(
    roomId: string,
    data: Partial<Meeting>,
  ): Promise<Meeting | null> {
    const doc = await MeetingModel.findOneAndUpdate(
      { roomId, isDeleted: { $ne: true } },
      data,
      {
        new: true,
      },
    );
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async deleteByRoomId(roomId: string): Promise<boolean> {
    const result = await MeetingModel.findOneAndUpdate(
      { roomId, isDeleted: { $ne: true } },
      { isDeleted: true, deletedAt: new Date() },
    );
    return result !== null;
  }

  async findPaginatedByProjectIds(
    projectIds: string[],
    limit: number,
    offset: number,
    status?: "SCHEDULED" | "HISTORY",
  ): Promise<{ meetings: Meeting[]; total: number }> {
    const query: Record<string, unknown> = {
      projectId: { $in: projectIds },
      isDeleted: { $ne: true },
    };

    const now = new Date();

    if (status === "SCHEDULED") {
      query.$or = [
        { status: { $in: ["SCHEDULED", "LIVE"] } },
        { scheduledAt: { $gte: now }, status: { $ne: "COMPLETED" } },
      ];
    } else if (status === "HISTORY") {
      query.$or = [
        { status: "COMPLETED" },
        { scheduledAt: { $lt: now }, status: { $ne: "LIVE" } },
      ];
    }
    const [docs, total] = await Promise.all([
      this.model
        .find(query)
        .sort({ scheduledAt: -1 })
        .skip(offset)
        .limit(limit),
      this.model.countDocuments(query),
    ]);
    return {
      meetings: docs.map((d) => this.toDomain(d)),
      total,
    };
  }
}
