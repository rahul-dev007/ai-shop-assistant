// app/api/admin/stats/route.ts
import { verifyAdminFromRequest } from "@/lib/adminAuth";
import { getProductModel } from "@/lib/models/Product";
import { getOrderModel } from "@/lib/models/Order";

export async function GET(req: Request) {
  const admin = verifyAdminFromRequest(req);
  if (!admin) return new Response("Unauthorized", { status: 401 });

  const Product = await getProductModel();
  const Order = await getOrderModel();

  // products summary: how many + total stock
  const [productAgg, orders] = await Promise.all([
    Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: { $ifNull: ["$stock", 0] } },
        },
      },
    ]),
    Order.find().populate("productId"),
  ]);

  const productStats =
    productAgg[0] || { totalProducts: 0, totalStock: 0 };

  let totalRevenue = 0;
  let pending = 0;
  let confirmed = 0;
  let shipped = 0;
  let delivered = 0;
  let cancelled = 0;

  for (const order of orders as any[]) {
    const status = order.status;

    if (status === "pending") pending++;
    else if (status === "confirmed") confirmed++;
    else if (status === "shipped") shipped++;
    else if (status === "delivered") delivered++;
    else if (status === "cancelled") cancelled++;

    const product = order.productId;
    const price =
      product && typeof product === "object" && product.price
        ? Number(product.price)
        : 0;

    totalRevenue += price * Number(order.quantity || 0);
  }

  const stats = {
    totalProducts: productStats.totalProducts,
    totalStock: productStats.totalStock,
    totalOrders: orders.length,
    pendingOrders: pending,
    confirmedOrders: confirmed,
    shippedOrders: shipped,
    deliveredOrders: delivered,
    cancelledOrders: cancelled,
    totalRevenue,
  };

  return Response.json(stats);
}
