import mongoose, { Document } from "mongoose";
import { Plan } from "../../domain/entities/Plan";
export interface IPlanDoc extends Document, Omit<Plan, "id"> {
}
declare const _default: mongoose.Model<IPlanDoc, {}, {}, {}, mongoose.Document<unknown, {}, IPlanDoc, {}, {}> & IPlanDoc & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=PlanModel.d.ts.map