"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const PlanSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    maxUsers: { type: Number, required: true },
    pricePerMonth: { type: Number, required: true }
});
exports.default = mongoose_1.default.model('Plan', PlanSchema);
//# sourceMappingURL=PlanModel.js.map