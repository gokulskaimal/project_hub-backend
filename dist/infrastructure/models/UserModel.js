"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const UserRole_1 = require("../../domain/enums/UserRole");
const UserSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String },
    password: { type: String },
    role: { type: String, enum: Object.values(UserRole_1.UserRole), required: true },
    orgId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Organization' },
    emailVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
});
exports.UserModel = mongoose_1.default.model("User", UserSchema);
exports.default = exports.UserModel;
//# sourceMappingURL=UserModel.js.map