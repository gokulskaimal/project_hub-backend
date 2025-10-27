import mongoose from 'mongoose';
declare const _default: mongoose.Model<{
    email: string;
    status: "PENDING" | "ACCEPTED" | "EXPIRED";
    orgId: string;
    token: string;
    expiry: NativeDate;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    email: string;
    status: "PENDING" | "ACCEPTED" | "EXPIRED";
    orgId: string;
    token: string;
    expiry: NativeDate;
}, {}, mongoose.DefaultSchemaOptions> & {
    email: string;
    status: "PENDING" | "ACCEPTED" | "EXPIRED";
    orgId: string;
    token: string;
    expiry: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    email: string;
    status: "PENDING" | "ACCEPTED" | "EXPIRED";
    orgId: string;
    token: string;
    expiry: NativeDate;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    email: string;
    status: "PENDING" | "ACCEPTED" | "EXPIRED";
    orgId: string;
    token: string;
    expiry: NativeDate;
}>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<{
    email: string;
    status: "PENDING" | "ACCEPTED" | "EXPIRED";
    orgId: string;
    token: string;
    expiry: NativeDate;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=InviteModel.d.ts.map