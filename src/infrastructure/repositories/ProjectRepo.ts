import { injectable } from "inversify";
import { Project } from "../../domain/entities/Project";
import { IProjectRepo } from "../../application/interface/repositories/IProjectRepo";
import { ProjectModel, IProjectDoc } from "../models/ProjectModel";
import { BaseRepository } from "./BaseRepo";
import { Model } from "mongoose";
@injectable()
export class ProjectRepo
  extends BaseRepository<Project, IProjectDoc>
  implements IProjectRepo
{
  constructor() {
    super(ProjectModel as unknown as Model<IProjectDoc>);
  }

  protected toDomain(doc: IProjectDoc): Project {
    const obj = doc.toObject();
    return {
      id: obj._id.toString(),
      orgId: obj.orgId,
      name: obj.name,
      description: obj.description,
      status: obj.status,
      startDate: obj.startDate,
      endDate: obj.endDate,
      priority: obj.priority,
      tags: obj.tags,
      teamMemberIds: obj.teamMemberIds,
      tasksPerWeek: obj.tasksPerWeek,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    } as Project;
  }

  async countByOrg(orgId: string): Promise<number> {
    return await this.model.countDocuments({ orgId });
  }

  async findByOrg(orgId: string): Promise<Project[]> {
    const docs = await this.model.find({ orgId }).sort({ createdAt: -1 });
    return docs.map((d) => this.toDomain(d));
  }

  async findByTeamMember(userId: string, orgId?: string): Promise<Project[]> {
    const query: Record<string, unknown> = { teamMemberIds: userId };
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
    },
  ): Promise<{ projects: Project[]; total: number }> {
    const query: Record<string, unknown> = {};
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

    const [docs, total] = await Promise.all([
      this.model.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit),
      this.model.countDocuments(query),
    ]);

    return {
      projects: docs.map((d) => this.toDomain(d)),
      total,
    };
  }

  async getProjectStats(orgId: string): Promise<{
    total: number;
    active: number;
    onHold: number;
    completed: number;
  }> {
    const stats = await this.model.aggregate([
      { $match: { orgId } },
      {
        $facet: {
          total: [{ $count: "count" }],
          statusCounts: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
        },
      },
    ]);

    const facet = stats[0];
    const result = {
      total: facet?.total[0]?.count || 0,
      active: 0,
      onHold: 0,
      completed: 0,
    };

    facet?.statusCounts.forEach((s: { _id: string; count: number }) => {
      const status = s._id;
      if (status === "ACTIVE") result.active = s.count;
      else if (status === "ON_HOLD") result.onHold = s.count;
      else if (status === "COMPLETED") result.completed = s.count;
    });

    return result;
  }

  async getProjectProgressReport(
    orgId: string,
  ): Promise<
    Array<{
      name: string;
      totalTasks: number;
      completedTasks: number;
      progress: number;
    }>
  > {
    return await this.model.aggregate([
      { $match: { orgId } },
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "projectId",
          as: "projectTasks",
        },
      },
      {
        $project: {
          name: 1,
          totalTasks: { $size: "$projectTasks" },
          completedTasks: {
            $size: {
              $filter: {
                input: "$projectTasks",
                as: "task",
                cond: { $eq: ["$$task.status", "DONE"] },
              },
            },
          },
        },
      },
      {
        $project: {
          name: 1,
          totalTasks: 1,
          completedTasks: 1,
          progress: {
            $cond: [
              { $gt: ["$totalTasks", 0] },
              {
                $multiply: [
                  { $divide: ["$completedTasks", "$totalTasks"] },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
    ]);
  }
}
