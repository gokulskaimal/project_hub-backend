"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const inviteSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true },
    orgId: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    status: {
        type: String,
        enum: ["PENDING", "ACCEPTED", "EXPIRED", "CANCELLED"],
        default: "PENDING",
    },
    expiry: { type: Date, required: true },
    role: { type: String, required: false },
}, { timestamps: true });
exports.default = mongoose_1.default.model("Invite", inviteSchema);
//# sourceMappingURL=InviteModel.js.map