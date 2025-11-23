import { Schema, models, model, Document, Types } from "mongoose";
import { connectDB } from "@/lib/db";

export type OrderStatus = "pending" | "confirmed" | "cancelled";

export interface IOrder extends Document {
  productId: Types.ObjectId;
  quantity: number;
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  source: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, default: 1 },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    source: { type: String, default: "facebook" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Order =
  (models.Order as ReturnType<typeof model<IOrder>>) ||
  model<IOrder>("Order", OrderSchema);

export async function getOrderModel() {
  await connectDB();
  return Order;
}

export default Order;
