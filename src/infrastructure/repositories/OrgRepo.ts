import { IOrgRepo } from "../../domain/interface/IOrgRepo";
import { Organization } from "../../domain/entities/Organization";
import OrgModel, { IOrgDOc } from "../models/OrgModel";

export class OrgRepo implements IOrgRepo{

    private toDomainOrg(orgDoc : IOrgDOc) : Organization{
        return {
            id: orgDoc.id ?? orgDoc._id.toString(),
            name: orgDoc.name,
            planId: orgDoc.planId ? orgDoc.planId.toString() : undefined
        }
    }
    async create(org : Partial<Organization>) : Promise<Organization>{
        const created = await OrgModel.create(org)
        return this.toDomainOrg(created)
    }

    async findById(id: string): Promise<Organization | null> {
        const org = await OrgModel.findById(id)
        return org ? this.toDomainOrg(org) : null
    }
}