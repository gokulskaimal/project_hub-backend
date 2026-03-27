import mongoose, { Schema, Document } from "mongoose";
import { Invoice } from "../../domain/entities/Invoice";

export interface IInvoiceDoc
  extends Omit<Invoice, "id" | "createdAt" | "updatedAt">, Document {
  createdAt?: Date;
  updatedAt?: Date;
}
const InvoiceSchema = new Schema<IInvoiceDoc>(
  {
    orgId: { type: String, required: true, index: true },
    planId: { type: String, required: true },
    razorpayPaymentId: { type: String, sparse: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: {
      type: String,
      enum: ["PAID", "PENDING", "FAILED"],
      requried: true,
      default: "PENDING",
    },
    billingDate: { type: Date, required: true, default: Date.now },
    invoicePdfUrl: { type: String },
  },
  { timestamps: true },
);

InvoiceSchema.set("toObject", { virtuals: true });
InvoiceSchema.set("toJSON", { virtuals: true });

export const InvoiceModel = mongoose.model<IInvoiceDoc>(
  "Invoice",
  InvoiceSchema,
);
