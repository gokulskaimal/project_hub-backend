"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanRepo = void 0;
const PlanModel_1 = __importDefault(require("../models/PlanModel"));
class PlanRepo {
    async findAll() {
        const plans = await PlanModel_1.default.find();
        return plans.map((plan) => ({
            id: plan._id.toString(),
            name: plan.name,
            maxUsers: plan.maxUsers,
            pricePerMonth: plan.pricePerMonth,
        }));
    }
    async findById(id) {
        const plan = await PlanModel_1.default.findById(id);
        if (!plan)
            return null;
        return {
            id: plan._id.toString(),
            name: plan.name,
            maxUsers: plan.maxUsers,
            pricePerMonth: plan.pricePerMonth,
        };
    }
    async create(plan) {
        const newPlan = await PlanModel_1.default.create(plan);
        return {
            id: newPlan._id.toString(),
            name: newPlan.name,
            maxUsers: newPlan.maxUsers,
            pricePerMonth: newPlan.pricePerMonth,
        };
    }
}
exports.PlanRepo = PlanRepo;
//# sourceMappingURL=PlanRepo.js.map