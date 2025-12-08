// app/api/admin/products/[id]/route.ts
import { verifyAdminFromRequest } from "@/lib/adminAuth";
import { getProductModel } from "@/lib/models/Product";

interface Params {
  params: { id: string };
}

// GET single product (optional, future use)
export async function GET(req: Request, { params }: Params) {
  const admin = verifyAdminFromRequest(req);
  if (!admin) return new Response("Unauthorized", { status: 401 });

  const Product = await getProductModel();
  const product = await Product.findById(params.id);
  if (!product) return new Response("Not found", { status: 404 });

  return Response.json(product);
}

// UPDATE
export async function PUT(req: Request, { params }: Params) {
  const admin = verifyAdminFromRequest(req);
  if (!admin) return new Response("Unauthorized", { status: 401 });

  const data = await req.json();

  const Product = await getProductModel();
  const updated = await Product.findByIdAndUpdate(params.id, data, {
    new: true,
  });

  if (!updated) return new Response("Not found", { status: 404 });

  return Response.json(updated);
}

// DELETE
export async function DELETE(req: Request, { params }: Params) {
  const admin = verifyAdminFromRequest(req);
  if (!admin) return new Response("Unauthorized", { status: 401 });

  const Product = await getProductModel();
  await Product.findByIdAndDelete(params.id);

  return new Response(null, { status: 204 });
}
