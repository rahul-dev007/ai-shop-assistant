import { verifyAdminFromRequest } from "@/lib/adminAuth";
// আগের মতোই model path ব্যবহার করো, তুমি Product model এখানে বানিয়েছিলে:
import { getProductModel } from "@/lib/models/Product"; // ✅ ঠিক path

// সব admin products আনবে
export async function GET(req: Request) {
  try {
    const admin = verifyAdminFromRequest(req);
    if (!admin) {
      return new Response("Unauthorized", { status: 401 });
    }

    const Product = await getProductModel();
    const products = await Product.find().sort({ createdAt: -1 });

    // সবসময় array return করবে
    return Response.json(products, { status: 200 });
  } catch (err) {
    console.error("GET /api/admin/products error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// নতুন product create করবে
export async function POST(req: Request) {
  try {
    const admin = verifyAdminFromRequest(req);
    if (!admin) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const Product = await getProductModel();
    const newProduct = await Product.create(body);

    return Response.json(newProduct, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/products error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
