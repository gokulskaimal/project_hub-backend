import {IPlanRepo} from '../../domain/interface/IPlanRepo'
import { Plan } from '../../domain/entities/Plan'
import PlanModel from '../models/PlanModel'

export class PlanRepo implements IPlanRepo{
    async findAll() : Promise<Plan[]>{
        const plans = await PlanModel.find()

        return plans.map((plan) => ({
            id: plan._id.toString(),
            name: plan.name,
            maxUsers: plan.maxUsers,
            pricePerMonth: plan.pricePerMonth,
        }))
    }

    async findById(id: string): Promise<Plan | null> {
        const plan = await PlanModel.findById(id)
        if(!plan) return null
        return{
            id : plan._id.toString(),
            name : plan.name,
            maxUsers : plan.maxUsers,
            pricePerMonth : plan.pricePerMonth
        }
    }

    async create(plan: Partial<Plan>): Promise<Plan> {
        const newPlan = await PlanModel.create(plan)
        return{
            id : newPlan._id.toString(),
            name : newPlan.name,
            maxUsers : newPlan.maxUsers,
            pricePerMonth : newPlan.pricePerMonth
        }
    }
}