import { Plan } from "../entities/Plan";

export interface IPlanRepo{
    findAll() : Promise<Plan[]>
    findById(id:string) : Promise<Plan | null>
    create(plan : Partial<Plan>) : Promise<Plan>
}