import { injectable } from "inversify";
import { IInvoiceRepo } from "../../application/interface/repositories/IInvoiceRepo";
import { Invoice } from "../../domain/entities/Invoice";
import { InvoiceModel } from "../models/InvoiceModel";
import mongoose, { PipelineStage } from "mongoose";

interface AggregatedInvoiceDoc {
  _id?: mongoose.Types.ObjectId;
  id?: string;
  orgId: string;
  planId: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: "PAID" | "PENDING" | "FAILED";
  billingDate: Date;
  invoicePdfUrl?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  org?: { name: string };
  plan?: { name: string; type: "STARTER" | "PRO" | "ENTERPRISE" };
}

@injectable()
export class InvoiceRepo implements IInvoiceRepo {
  async create(data: Partial<Invoice>): Promise<Invoice> {
    const freshInvoice = await InvoiceModel.create(data);
    return this.toDomain(freshInvoice);
  }

  async findById(id: string): Promise<Invoice | null> {
    const doc = await InvoiceModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async findByOrgId(
    orgId: string,
    skip: number,
    limit: number,
  ): Promise<{ items: Invoice[]; total: number }> {
    const pipeline: PipelineStage[] = [
      { $match: { orgId } },
      {
        $addFields: {
          planObjectId: { $toObjectId: "$planId" },
        },
      },
      {
        $lookup: {
          from: "plans",
          localField: "planObjectId",
          foreignField: "_id",
          as: "plan",
        },
      },
      {
        $unwind: {
          path: "$plan",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await InvoiceModel.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const docs = await InvoiceModel.aggregate<AggregatedInvoiceDoc>(pipeline);

    const items = docs.map((doc) => this.toDomain(doc));
    return { items, total };
  }

  async findAllPaginated(
    skip: number,
    limit: number,
    search?: string,
    status?: string,
    sort?: string,
    planType?: string,
  ): Promise<{ items: Invoice[]; total: number; totalRevenue: number }> {
    const pipeline: PipelineStage[] = [
      {
        $addFields: {
          orgObjectId: { $toObjectId: "$orgId" },
          planObjectId: { $toObjectId: "$planId" },
        },
      },
      {
        $lookup: {
          from: "organizations",
          localField: "orgObjectId",
          foreignField: "_id",
          as: "org",
        },
      },
      {
        $unwind: {
          path: "$org",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "plans",
          localField: "planObjectId",
          foreignField: "_id",
          as: "plan",
        },
      },
      {
        $unwind: {
          path: "$plan",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    const matchStage: Record<string, unknown> = {};
    if (search) {
      matchStage["org.name"] = { $regex: search, $options: "i" };
    }
    if (status && status !== "ALL") {
      matchStage.status = status;
    }
    if (planType && planType !== "ALL") {
      matchStage["plan.type"] = planType;
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    const sortStage: Record<string, 1 | -1> = {};
    if (sort === "amount_asc") sortStage.amount = 1;
    else if (sort === "amount_desc") sortStage.amount = -1;
    else sortStage.createdAt = -1;

    // Use facets to get total count, total revenue, and paginated items in ONE call
    const facetPipeline: PipelineStage[] = [
      ...pipeline,
      {
        $facet: {
          metadata: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                totalRevenue: { $sum: "$amount" },
              },
            },
          ],
          data: [{ $sort: sortStage }, { $skip: skip }, { $limit: limit }],
        },
      },
    ];

    const [result] = await InvoiceModel.aggregate<{
      metadata: Array<{ total: number; totalRevenue: number }>;
      data: AggregatedInvoiceDoc[];
    }>(facetPipeline);

    const metadata = result.metadata[0] || { total: 0, totalRevenue: 0 };
    const items = result.data.map((doc) => this.toDomain(doc));

    return {
      items,
      total: metadata.total,
      totalRevenue: metadata.totalRevenue,
    };
  }

  private toDomain(doc: AggregatedInvoiceDoc): Invoice {
    return {
      id: (doc.id || doc._id)?.toString() || "",
      orgId: doc.orgId,
      planId: doc.planId,
      razorpayPaymentId: doc.razorpayPaymentId || "",
      amount: doc.amount,
      currency: doc.currency,
      status: doc.status,
      billingDate: doc.billingDate,
      invoicePdfUrl: doc.invoicePdfUrl,
      createdAt: doc.createdAt
        ? new Date(doc.createdAt).toISOString()
        : undefined,
      updatedAt: doc.updatedAt
        ? new Date(doc.updatedAt).toISOString()
        : undefined,
      orgName: doc.org?.name,
      planName: doc.plan?.name,
      planType: doc.plan?.type,
    };
  }
}
