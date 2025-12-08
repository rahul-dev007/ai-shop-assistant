// app/api/admin/orders/[id]/route.ts
import { verifyAdminFromRequest } from "@/lib/adminAuth";
import { getOrderModel } from "@/lib/models/Order";

interface Params {
  params: { id: string };
}

// GET single order (future use)
export async function GET(req: Request, { params }: Params) {
  const admin = verifyAdminFromRequest(req);
  if (!admin) return new Response("Unauthorized", { status: 401 });

  const Order = await getOrderModel();
  const order = await Order.findById(params.id).populate("productId");
  if (!order) return new Response("Not found", { status: 404 });

  return Response.json(order);
}

// UPDATE (status বা অন্য কিছু)
export async function PUT(req: Request, { params }: Params) {
  const admin = verifyAdminFromRequest(req);
  if (!admin) return new Response("Unauthorized", { status: 401 });

  const data = await req.json();

  const Order = await getOrderModel();
  const updated = await Order.findByIdAndUpdate(params.id, data, {
    new: true,
  }).populate("productId");

  if (!updated) return new Response("Not found", { status: 404 });

  return Response.json(updated);
}
