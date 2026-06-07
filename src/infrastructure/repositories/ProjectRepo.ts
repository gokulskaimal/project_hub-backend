import { injectable } from "inversify";
import { Project } from "../../domain/entities/Project";
import { IProjectRepo } from "../../application/interface/repositories/IProjectRepo";
import { ProjectModel, IProjectDoc } from "../models/ProjectModel";
import { BaseRepository } from "./BaseRepo";
import { Model, ClientSession } from "mongoose";
@injectable()
export class ProjectRepo
  extends BaseRepository<Project, IProjectDoc>
  implements IProjectRepo
{
  constructor() {
    super(ProjectModel as unknown as Model<IProjectDoc>);
  }

  protected toDomain(doc: IProjectDoc): Project {
    const obj = doc.toObject ? doc.toObject() : doc;
    return {
      id: obj._id?.toString(),
      orgId: obj.orgId?.toString(),
      name: obj.name,
      description: obj.description,
      status: obj.status,
      startDate: obj.startDate,
      endDate: obj.endDate,
      priority: obj.priority,
      tags: obj.tags,
      teamMemberIds: obj.teamMemberIds,
      tasksPerWeek: obj.tasksPerWeek,
      progress: obj.progress || 0,
      totalTasks: obj.totalTasks || 0,
      completedTasks: obj.completedTasks || 0,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    } as Project;
  }

  async findById(id: string): Promise<Project | null> {
    const doc = await this.model.findOne({ _id: id, isDeleted: { $ne: true } });
    return doc ? this.toDomain(doc) : null;
  }

  async countByOrg(orgId: string): Promise<number> {
    return await this.model.countDocuments({ orgId, isDeleted: { $ne: true } });
  }

  async findByOrg(orgId: string): Promise<Project[]> {
    const docs = await this.model
      .find({ orgId, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 });
    return docs.map((d) => this.toDomain(d));
  }

  async findByTeamMember(userId: string, orgId?: string): Promise<Project[]> {
    const query: Record<string, unknown> = {
      teamMemberIds: userId,
      isDeleted: { $ne: true },
    };
    if (orgId) query.orgId = orgId;
    const docs = await this.model.find(query).sort({ createdAt: -1 });
    return docs.map((d) => this.toDomain(d));
  }

  async findPaginated(
    limit: number,
    offset: number,
    filters?: {
      orgId?: string;
      status?: string;
      priority?: string;
      searchTerm?: string;
      tags?: string[];
    },
  ): Promise<{ projects: Project[]; total: number }> {
    const query: Record<string, unknown> = { isDeleted: { $ne: true } };
    if (filters?.orgId) query.orgId = filters.orgId;
    if (filters?.status && filters.status !== "ALL")
      query.status = filters.status;
    if (filters?.priority && filters.priority !== "ALL")
      query.priority = filters.priority;
    if (filters?.searchTerm) {
      query.$or = [
        { name: { $regex: filters.searchTerm, $options: "i" } },
        { description: { $regex: filters.searchTerm, $options: "i" } },
      ];
    }

    if (filters?.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    const [docs, total] = await Promise.all([
      this.model.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit),
      this.model.countDocuments(query),
    ]);

    return {
      projects: docs.map((d) => this.toDomain(d)),
      total,
    };
  }
  async incrementStats(
    projectId: string,
    stats: { totalTasks?: number; completedTasks?: number },
    session?: ClientSession,
  ): Promise<Project | null> {
    const totalInc = stats.totalTasks || 0;
    const completeInc = stats.completedTasks || 0;
    const doc = await this.model.findOneAndUpdate(
      { _id: projectId, isDeleted: { $ne: true } },
      [
        {
          $set: {
            totalTasks: {
              $max: [0, { $add: [{ $ifNull: ["$totalTasks", 0] }, totalInc] }],
            },
            completedTasks: {
              $max: [
                0,
                { $add: [{ $ifNull: ["$completedTasks", 0] }, completeInc] },
              ],
            },
          },
        },
        {
          $set: {
            progress: {
              $cond: {
                if: { $gt: ["$totalTasks", 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ["$completedTasks", "$totalTasks"] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
          },
        },
      ],
      { new: true, session },
    );
    return doc ? this.toDomain(doc) : null;
  }
}
