// app/api/admin/orders/route.ts
import { verifyAdminFromRequest } from "@/lib/adminAuth";
import { getOrderModel } from "@/lib/models/Order";

export async function GET(req: Request) {
  const admin = verifyAdminFromRequest(req);
  if (!admin) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const Order = await getOrderModel();

  const query: any = {};
  if (status && status !== "all") {
    query.status = status;
  }

  const orders = await Order.find(query)
    .populate("productId")
    .sort({ createdAt: -1 });

  return Response.json(orders);
}
