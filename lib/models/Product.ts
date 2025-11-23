import { Schema, models, model, type Document, type Model } from "mongoose";
import { connectDB } from "@/lib/db";

export interface IProduct extends Document {
  name_bn: string;
  name_en?: string;
  category: string;
  price: number;
  tags: string[];
  imageUrl?: string;
  description_bn?: string;
  colors?: string[];
  sizes?: string[];
  stock?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name_bn: { type: String, required: true },
    name_en: { type: String },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    tags: { type: [String], default: [] },
    imageUrl: { type: String },
    description_bn: { type: String },
    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    stock: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// 👇 এখানে টাইপ ঠিক করা হলো
const Product: Model<IProduct> =
  (models.Product as Model<IProduct>) ||
  model<IProduct>("Product", ProductSchema);

export async function getProductModel() {
  await connectDB();
  return Product;
}

export default Product;
