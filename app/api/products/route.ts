import { NextRequest, NextResponse } from "next/server";
import { getProductModel } from "@/lib/models/Product";

export async function GET(req: NextRequest) {
  try {
    const Product = await getProductModel();
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const limitParam = searchParams.get("limit") || "20";

    const limit = Number.isNaN(Number(limitParam)) ? 20 : Number(limitParam);

    const filter: any = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [
        { name_bn: regex },
        { name_en: regex },
        { tags: regex },
        { description_bn: regex },
      ];
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      products: products.map((p: any) => ({
        productId: p._id.toString(),
        name_bn: p.name_bn,
        name_en: p.name_en,
        category: p.category,
        price: p.price,
        tags: p.tags,
        imageUrl: p.imageUrl,
        description_bn: p.description_bn,
        colors: p.colors,
        sizes: p.sizes,
        stock: p.stock,
      })),
    });
  } catch (err) {
    console.error("Error in GET /api/products", err);
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 }
    );
  }
}
