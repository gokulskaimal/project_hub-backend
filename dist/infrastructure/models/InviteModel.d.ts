import mongoose from "mongoose";
declare const _default: mongoose.Model<{
    orgId: string;
    token: string;
    email: string;
    status: "EXPIRED" | "CANCELLED" | "PENDING" | "ACCEPTED";
    expiry: NativeDate;
    role?: string | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    orgId: string;
    token: string;
    email: string;
    status: "EXPIRED" | "CANCELLED" | "PENDING" | "ACCEPTED";
    expiry: NativeDate;
    role?: string | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    orgId: string;
    token: string;
    email: string;
    status: "EXPIRED" | "CANCELLED" | "PENDING" | "ACCEPTED";
    expiry: NativeDate;
    role?: string | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    orgId: string;
    token: string;
    email: string;
    status: "EXPIRED" | "CANCELLED" | "PENDING" | "ACCEPTED";
    expiry: NativeDate;
    role?: string | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    orgId: string;
    token: string;
    email: string;
    status: "EXPIRED" | "CANCELLED" | "PENDING" | "ACCEPTED";
    expiry: NativeDate;
    role?: string | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    orgId: string;
    token: string;
    email: string;
    status: "EXPIRED" | "CANCELLED" | "PENDING" | "ACCEPTED";
    expiry: NativeDate;
    role?: string | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=InviteModel.d.ts.map