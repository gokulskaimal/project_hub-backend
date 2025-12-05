"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanRepo = void 0;
const inversify_1 = require("inversify");
const BaseRepository_1 = require("./BaseRepository");
const PlanModel_1 = __importDefault(require("../models/PlanModel"));
let PlanRepo = class PlanRepo extends BaseRepository_1.BaseRepository {
    constructor() {
        super(PlanModel_1.default);
    }
    toDomain(doc) {
        const obj = doc.toObject();
        return {
            id: obj._id.toString(),
            name: obj.name,
            description: obj.description,
            price: obj.price,
            currency: obj.currency,
            features: obj.features,
            type: obj.type,
            isActive: obj.isActive,
            razorpayPlanId: obj.razorpayPlanId,
            limits: obj.limits,
            createdAt: obj.createdAt,
            updatedAt: obj.updatedAt,
        };
    }
    async create(data) {
        const doc = await this.model.create(data);
        return this.toDomain(doc);
    }
    async findAll(filter = { isActive: true }) {
        const docs = await this.model.find(filter);
        return docs.map((d) => this.toDomain(d));
    }
    async findById(id) {
        const docs = await this.model.findById(id);
        return docs ? this.toDomain(docs) : null;
    }
    async update(id, plan) {
        const doc = await this.model.findByIdAndUpdate(id, plan, { new: true });
        return doc ? this.toDomain(doc) : null;
    }
    async delete(id) {
        const result = await this.model.findByIdAndDelete(id);
        return !!result;
    }
};
exports.PlanRepo = PlanRepo;
exports.PlanRepo = PlanRepo = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], PlanRepo);
//# sourceMappingURL=PlanRepo.js.map