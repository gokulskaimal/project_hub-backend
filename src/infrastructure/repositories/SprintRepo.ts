import { injectable } from "inversify";
import { BaseRepository } from "./BaseRepo";
import { ISprintRepo } from "../interface/repositories/ISprintRepo";
import { Sprint } from "../../domain/entities/Sprint";
import { ISprintDoc, SprintModel } from "../models/SprintModel";

@injectable()
export class SprintRepo
  extends BaseRepository<Sprint, ISprintDoc>
  implements ISprintRepo
{
  constructor() {
    super(SprintModel);
  }

  // IMPLEMENTED ABSTRACT METHOD
  protected toDomain(doc: ISprintDoc): Sprint {
    return {
      id: doc._id.toString(),
      projectId: doc.projectId,
      name: doc.name,
      description: doc.description || "",
      startDate: doc.startDate,
      endDate: doc.endDate,
      status: doc.status as "PLANNED" | "ACTIVE" | "COMPLETED",
      goal: doc.goal,
      createdAt: doc.createdAt as Date,
      updatedAt: doc.updatedAt as Date,
    };
  }

  async findByProject(projectId: string): Promise<Sprint[]> {
    const docs = await this.model.find({ projectId }).sort({ startDate: 1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findActiveSprint(projectId: string): Promise<Sprint | null> {
    const doc = await this.model.findOne({ projectId, status: "ACTIVE" });
    return doc ? this.toDomain(doc) : null;
  }

  async countSprint(projectId: string): Promise<number> {
    const start = new Date();

    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 0, 0, 0);
    const count = await this.model.countDocuments(
      { projectId },
      { createdAt: { $gte: start, $lte: end } },
    );
    return count;
  }
}
