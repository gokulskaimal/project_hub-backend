import { Organization } from "../entities/Organization";

export interface IOrgRepo{
    create(org:Partial<Organization>) : Promise<Organization>
    findById(id:string) : Promise<Organization | null>
}