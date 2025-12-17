import { Project } from "../../../domain/entities/Project";
import { IBaseRepository } from "./IBaseRepo";

export interface IProjectRepo extends IBaseRepository<Project> {
    countByOrg(orgId : string) : Promise<number>
    findByOrg(orgId : string) : Promise<Project[]>
}


