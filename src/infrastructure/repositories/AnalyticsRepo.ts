import { inject, injectable } from "inversify";
import {
  IAnalyticsRepo,
  EpicProgressItem,
} from "../../application/interface/repositories/IAnalyticsRepo";
import UserModel from "../models/UserModel";
import OrgModel from "../models/OrgModel";
import { TaskModel } from "../models/TaskModel";
import { ProjectModel } from "../models/ProjectModel";
import InviteModel from "../models/InviteModel";
import { InvoiceModel } from "../models/InvoiceModel";
import mongoose from "mongoose";
import { TYPES } from "../container/types";
import { ILogger } from "../../application/interface/services/ILogger";
import { UserRole } from "../../domain/enums/UserRole";
import { DateUtils, TimeFrame } from "../../utils/DateUtils";

import {
  StatusDistributionItem,
  PerformanceMetric,
  MonthlyVelocityItem,
  ProjectHealthItem,
  MemberWorkloadItem,
  ProjectProgressItem,
} from "../../application/interface/repositories/IAnalyticsRepo";

@injectable()
export class AnalyticsRepo implements IAnalyticsRepo {
  constructor(@inject(TYPES.ILogger) private _logger: ILogger) {}

  async getGlobalUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    pending: number;
    verified: number;
    unverified: number;
    byRole: Record<string, number>;
  }> {
    const results = await UserModel.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          statusCounts: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          verifiedCounts: [
            { $group: { _id: "$emailVerified", count: { $sum: 1 } } },
          ],
          roleCounts: [{ $group: { _id: "$role", count: { $sum: 1 } } }],
        },
      },
    ]);

    const facet = results[0];
    const stats = {
      total: facet.total[0]?.count || 0,
      active: 0,
      inactive: 0,
      pending: 0,
      verified: 0,
      unverified: 0,
      byRole: {} as Record<string, number>,
    };

    facet.statusCounts.forEach((s: { _id: string; count: number }) => {
      if (s._id === "ACTIVE") stats.active = s.count;
      if (s._id === "INACTIVE" || s._id === "BLOCKED")
        stats.inactive += s.count;
      if (s._id === "PENDING_VERIFICATION") stats.pending = s.count;
    });
    facet.verifiedCounts.forEach((v: { _id: boolean; count: number }) => {
      if (v._id === true) stats.verified = v.count;
      if (v._id === false) stats.unverified = v.count;
    });
    facet.roleCounts.forEach((r: { _id: string; count: number }) => {
      stats.byRole[r._id || "UNKNOWN"] = r.count;
    });
    return stats;
  }

  async getOrgStats(): Promise<{
    statusDistribution: Array<{ status: string; count: number }>;
    planPerformance: Array<{ planName: string; count: number }>;
  }> {
    const [statusDistribution, planPerformance] = await Promise.all([
      OrgModel.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { status: "$_id", count: 1, _id: 0 } },
      ]),
      OrgModel.aggregate([
        { $group: { _id: "$planId", count: { $sum: 1 } } },
        {
          $lookup: {
            from: "plans",
            localField: "_id",
            foreignField: "_id",
            as: "plan",
          },
        },
        { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            planName: { $ifNull: ["$plan.name", "Basic / No Plan"] },
            count: 1,
            _id: 0,
          },
        },
      ]),
    ]);
    return { statusDistribution, planPerformance };
  }

  async getOrgMemberStats(orgId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    const results = await UserModel.aggregate([
      {
        $match: {
          orgId: new mongoose.Types.ObjectId(orgId),
          role: { $nin: [UserRole.SUPER_ADMIN, UserRole.ORG_MANAGER] },
        },
      },
      {
        $facet: {
          total: [{ $count: "count" }],
          statusCounts: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
        },
      },
    ]);

    const facet = results[0];
    const stats = {
      total: facet.total[0]?.count || 0,
      active: 0,
      inactive: 0,
    };
    facet.statusCounts.forEach((s: { _id: string; count: number }) => {
      if (s._id === "ACTIVE") stats.active = s.count;
      if (["INACTIVE", "BLOCKED", "PENDING_VERIFICATION"].includes(s._id)) {
        stats.inactive += s.count;
      }
    });
    return stats;
  }

  async getTaskStatusDistribution(
    orgId: string,
    userId?: string,
    timeFrame?: TimeFrame,
  ): Promise<StatusDistributionItem[]> {
    const match: Record<string, unknown> = { orgId };
    if (userId) match.assignedTo = userId;

    if (timeFrame) {
      const { startDate } = DateUtils.getTimeFrameRange(timeFrame);
      match.createdAt = { $gte: startDate };
    }

    const result = await TaskModel.aggregate([
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
  ): Promise<MonthlyVelocityItem[]> {
    const { startDate, groupFormat } = DateUtils.getTimeFrameRange(
      timeFrame || "YEAR",
    );
    const match: Record<string, unknown> = {
      status: "DONE",
      completedAt: { $gte: startDate, $ne: null },
    };
    if (orgId) match.orgId = orgId;
    if (userId) match.assignedTo = userId;

    const result = await TaskModel.aggregate([
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

  async getTopPerformers(
    orgId: string,
    limit: number,
    timeFrame?: TimeFrame,
  ): Promise<PerformanceMetric[]> {
    const match: Record<string, unknown> = {
      orgId,
      status: "DONE",
      completedAt: { $exists: true },
    };

    if (timeFrame) {
      const { startDate } = DateUtils.getTimeFrameRange(timeFrame);
      const currentCompletedAt = match.completedAt as Record<string, unknown>;
      match.completedAt = { ...currentCompletedAt, $gte: startDate };
    }

    return await TaskModel.aggregate([
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
      { $addFields: { assigneeId: { $toObjectId: "$_id" } } },
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
  }

  async getDonePointsInRange(
    scope: "user" | "project",
    id: string,
    start: Date,
    end: Date,
  ): Promise<number> {
    const match: Record<string, unknown> = {
      status: "DONE",
      completedAt: { $gte: start, $lte: end },
    };

    if (scope === "user") match.assignedTo = id;
    else match.projectId = id;

    const result = await TaskModel.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$storyPoints" } } },
    ]);
    return result[0]?.total || 0;
  }

  async getProjectStats(orgId: string): Promise<Record<string, number>> {
    const stats = await ProjectModel.aggregate([
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
      if (s._id === "ACTIVE") result.active = s.count;
      else if (s._id === "ON_HOLD") result.onHold = s.count;
      else if (s._id === "COMPLETED") result.completed = s.count;
    });

    return result;
  }

  async getProjectProgressReport(
    orgId: string,
  ): Promise<ProjectProgressItem[]> {
    return await ProjectModel.aggregate([
      { $match: { orgId } },
      {
        $project: {
          name: 1,
          totalTasks: 1,
          completedTasks: 1,
          progress: 1,
        },
      },
    ]);
  }

  async getInvitationStats(orgId?: string): Promise<Record<string, number>> {
    const match = orgId ? { orgId } : {};
    const stats = await InviteModel.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const result = {
      total: 0,
      pending: 0,
      accepted: 0,
      expired: 0,
      cancelled: 0,
    };

    stats.forEach((s: { _id: string; count: number }) => {
      const status = s._id.toLowerCase() as keyof typeof result;
      if (status in result) {
        (result[status] as number) = s.count;
      }
      result.total += s.count;
    });

    return result;
  }

  async getRevenueStats(
    orgId?: string,
    timeFrame?: TimeFrame,
  ): Promise<Array<{ month: string; amount: number }>> {
    const { startDate, groupFormat } = DateUtils.getTimeFrameRange(
      timeFrame || "YEAR",
    );
    const match: Record<string, unknown> = {
      status: "PAID",
      createdAt: { $gte: startDate },
    };
    if (orgId) match.orgId = orgId;

    return await InvoiceModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          month: "$_id",
          amount: "$total",
          _id: 0,
        },
      },
    ]);
  }

  async getInvoicePlanPerformance(): Promise<
    Array<{ planName: string; count: number; totalRevenue: number }>
  > {
    return await InvoiceModel.aggregate([
      { $match: { status: "PAID" } },
      {
        $group: {
          _id: "$planId",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "plans",
          let: { planIdObj: { $toObjectId: "$_id" } },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$planIdObj"] } } }],
          as: "planDetails",
        },
      },
      { $unwind: { path: "$planDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          planName: { $ifNull: ["$planDetails.name", "Uncategorized Plan"] },
          count: 1,
          totalRevenue: 1,
          _id: 0,
        },
      },
    ]);
  }

  async getUserCountsByOrgIds(orgIds: string[]): Promise<Map<string, number>> {
    const userCounts = await UserModel.aggregate([
      {
        $match: {
          orgId: {
            $in: orgIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
        },
      },
      { $group: { _id: "$orgId", count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    userCounts.forEach((c: { _id: mongoose.Types.ObjectId; count: number }) => {
      countMap.set(c._id.toString(), c.count);
    });
    return countMap;
  }

  async getEpicProgressReport(projectId: string): Promise<EpicProgressItem[]> {
    return await TaskModel.aggregate([
      {
        $match: {
          projectId,
          type: "EPIC",
        },
      },
      { $addFields: { epicIdStr: { $toString: "$_id" } } },
      {
        $lookup: {
          from: "tasks",
          localField: "epicIdStr",
          foreignField: "epicId",
          as: "stories",
        },
      },
      {
        $project: {
          title: 1,
          status: 1,
          totalStories: { $size: "$stories" },
          doneStories: {
            $size: {
              $filter: {
                input: "$stories",
                as: "s",
                cond: { $eq: ["$$s.status", "DONE"] },
              },
            },
          },
        },
      },
      {
        $project: {
          id: "$_id",
          title: 1,
          status: 1,
          totalStories: 1,
          completedStories: "$doneStories",
          progress: {
            $cond: [
              { $gt: ["$totalStories", 0] },
              {
                $multiply: [
                  { $divide: ["$doneStories", "$totalStories"] },
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

  async getProjectHealthReport(orgId: string): Promise<ProjectHealthItem[]> {
    const now = new Date();
    // For health report, we still need to check tasks for overdue status because overdue is time-dependent.
    // However, we can optimize the lookup to only fetch what we need.
    return await ProjectModel.aggregate([
      { $match: { orgId, status: "ACTIVE" } },
      { $addFields: { projectIdStr: { $toString: "$_id" } } },
      {
        $lookup: {
          from: "tasks",
          localField: "projectIdStr",
          foreignField: "projectId",
          as: "projectTasks",
        },
      },
      {
        $project: {
          name: 1,
          overdueCount: {
            $size: {
              $filter: {
                input: "$projectTasks",
                as: "task",
                cond: {
                  $and: [
                    { $ne: ["$$task.status", "DONE"] },
                    { $lt: ["$$task.dueDate", now] },
                  ],
                },
              },
            },
          },
          totalActiveTasks: { $subtract: ["$totalTasks", "$completedTasks"] },
          id: "$_id",
        },
      },
      {
        $addFields: {
          health: {
            $cond: [
              { $gt: ["$overdueCount", 3] },
              "RED",
              {
                $cond: [{ $gt: ["$overdueCount", 0] }, "AMBER", "GREEN"],
              },
            ],
          },
        },
      },
    ]);
  }

  async getMemberWorkloadReport(orgId: string): Promise<MemberWorkloadItem[]> {
    return await TaskModel.aggregate([
      { $match: { orgId, status: { $ne: "DONE" } } },
      {
        $group: {
          _id: "$assignedTo",
          taskCount: { $sum: 1 },
          totalPoints: { $sum: "$storyPoints" },
        },
      },
      { $addFields: { assigneeId: { $toObjectId: "$_id" } } },
      {
        $lookup: {
          from: "users",
          localField: "assigneeId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          name: { $concat: ["$user.firstName", " ", "$user.lastName"] },
          taskCount: 1,
          totalPoints: 1,
          _id: 0,
        },
      },
      { $sort: { taskCount: -1 } },
    ]);
  }
}
