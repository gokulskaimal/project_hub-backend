import mongoose, { Document, Types } from 'mongoose';
export interface IPlanDoc extends Document {
    _id: Types.ObjectId;
    name: string;
    maxUsers: number;
    pricePerMonth: number;
}
declare const _default: mongoose.Model<IPlanDoc, {}, {}, {}, mongoose.Document<unknown, {}, IPlanDoc, {}, mongoose.DefaultSchemaOptions> & IPlanDoc & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, mongoose.Schema<IPlanDoc, mongoose.Model<IPlanDoc, any, any, any, mongoose.Document<unknown, any, IPlanDoc, any, {}> & IPlanDoc & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, IPlanDoc, mongoose.Document<unknown, {}, mongoose.FlatRecord<IPlanDoc>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<IPlanDoc> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=PlanModel.d.ts.map