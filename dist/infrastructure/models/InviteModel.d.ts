import mongoose from "mongoose";
declare const _default: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    orgId: string;
    status: "EXPIRED" | "CANCELLED" | "PENDING" | "ACCEPTED";
    token: string;
    expiry: NativeDate;
    role?: string | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    orgId: string;
    status: "EXPIRED" | "CANCELLED" | "PENDING" | "ACCEPTED";
    token: string;
    expiry: NativeDate;
    role?: string | null | undefined;
}, {}, {
    timestamps: true;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    orgId: string;
    status: "EXPIRED" | "CANCELLED" | "PENDING" | "ACCEPTED";
    token: string;
    expiry: NativeDate;
    role?: string | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    orgId: string;
    status: "EXPIRED" | "CANCELLED" | "PENDING" | "ACCEPTED";
    token: string;
    expiry: NativeDate;
    role?: string | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    orgId: string;
    status: "EXPIRED" | "CANCELLED" | "PENDING" | "ACCEPTED";
    token: string;
    expiry: NativeDate;
    role?: string | null | undefined;
}>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    orgId: string;
    status: "EXPIRED" | "CANCELLED" | "PENDING" | "ACCEPTED";
    token: string;
    expiry: NativeDate;
    role?: string | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=InviteModel.d.ts.map