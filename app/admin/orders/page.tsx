// app/admin/orders/page.tsx
"use client";

import { useGetOrdersQuery, useUpdateOrderMutation } from "@/lib/adminApi";
import { useState } from "react";

const STATUS_OPTIONS = [
  "all",
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]>("all");

  const { data, isLoading, error } = useGetOrdersQuery(
    statusFilter === "all" ? undefined : { status: statusFilter }
  );

  const [updateOrder] = useUpdateOrderMutation();

  const orders = data ?? [];

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      await updateOrder({ id, data: { status: newStatus as any } }).unwrap();
    } catch (err) {
      console.error("Failed to update order", err);
      alert("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে");
    }
  }

  function formatDate(dateString: string) {
    const d = new Date(dateString);
    return d.toLocaleString("bn-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin – Orders</h1>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm">Filter by status:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="border border-slate-700 bg-slate-900 text-sm rounded px-2 py-1"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All" : s}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p>Loading orders...</p>}
      {error && <p className="text-red-400">Failed to load orders</p>}

      {!isLoading && !error && (
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/60">
              <tr>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Customer</th>
                <th className="p-2 text-left">Phone</th>
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-left">Qty</th>
                <th className="p-2 text-left">Source</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/40">
              {orders.map((o) => {
                const product: any = o.productId; // populated object or id string
                const productName =
                  product && typeof product === "object"
                    ? product.name_bn || product.name_en || product._id
                    : o.productId;

                return (
                  <tr key={o._id}>
                    <td className="p-2">{formatDate(o.createdAt)}</td>
                    <td className="p-2">
                      <div className="font-medium">{o.fullName}</div>
                      <div className="text-xs text-slate-400">{o.email}</div>
                    </td>
                    <td className="p-2">{o.phone}</td>
                    <td className="p-2">
                      <div>{productName}</div>
                    </td>
                    <td className="p-2">{o.quantity}</td>
                    <td className="p-2">{o.source || "-"}</td>
                    <td className="p-2">
                      <select
                        value={o.status}
                        onChange={(e) =>
                          handleStatusChange(o._id, e.target.value)
                        }
                        className="border border-slate-700 bg-slate-900 text-xs rounded px-2 py-1"
                      >
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="shipped">shipped</option>
                        <option value="delivered">delivered</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                  </tr>
                );
              })}

              {orders.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-slate-400" colSpan={7}>
                    কোন অর্ডার পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
