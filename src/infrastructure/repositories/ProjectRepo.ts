import { injectable } from "inversify";
import { Project } from "../../domain/entities/Project";
import { IProjectRepo } from "../interface/repositories/IProjectRepo";
import { ProjectModel , IProjectDoc } from "../models/ProjectModel";
import { BaseRepository } from "./BaseRepo";
import { Model } from "mongoose";
@injectable()

export class ProjectRepo extends BaseRepository<Project , IProjectDoc> implements IProjectRepo{

    constructor(){
        super(ProjectModel as unknown as Model<IProjectDoc>)
    }

    protected toDomain(doc : IProjectDoc) : Project{
        const obj = doc.toObject()
        return{
            id : obj._id.toString(),
            orgId : obj.orgId,
            name : obj.name,
            description : obj.description,
            status: obj.status,
            startDate : obj.startDate,
            endDate : obj.endDate,
            priority: obj.priority,
            tags: obj.tags,
            teamMemberIds: obj.teamMemberIds,
            createdAt : obj.createdAt,
            updatedAt : obj.updatedAt
        } as Project
    }
    

    async countByOrg(orgId: string): Promise<number> {
        return await this.model.countDocuments({orgId})
    }
    

    async findByOrg(orgId: string): Promise<Project[]> {
        const docs = await this.model.find({orgId}).sort({createdAt : -1})
        return docs.map((d) => this.toDomain(d))
    }
}