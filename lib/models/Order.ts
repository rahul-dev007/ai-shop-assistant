// models/Order.ts
import { Schema, model, models, type Document, type Model } from "mongoose";
import { connectDB } from "@/lib/db";

export interface IOrder extends Document {
  productId: Schema.Types.ObjectId;
  quantity: number;
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  source?: string; // e.g. "facebook", "instagram", "website"
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    source: { type: String },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Order: Model<IOrder> =
  (models.Order as Model<IOrder>) || model<IOrder>("Order", OrderSchema);

export async function getOrderModel() {
  await connectDB();
  return Order;
}

export default Order;
