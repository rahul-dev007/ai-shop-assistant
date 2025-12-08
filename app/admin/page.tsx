// app/admin/page.tsx
"use client";

import {
  useGetDashboardStatsQuery,
  useGetOrdersQuery,
} from "@/lib/adminApi";

function formatNumber(num: number | undefined | null) {
  if (!num) return "0";
  return num.toLocaleString("bn-BD");
}

function formatMoney(num: number | undefined | null) {
  if (!num) return "৳ 0";
  return `৳ ${num.toLocaleString("bn-BD")}`;
}

function formatDate(dateString: string) {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "-"; // ⚠️ invalid date হলে app ক্র্যাশ করবে না
  return d.toLocaleString("bn-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminDashboardPage() {
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useGetDashboardStatsQuery();

  const {
    data: ordersData,
    isLoading: ordersLoading,
  } = useGetOrdersQuery({ status: "all" });

  // ⚠️ data সবসময় array হোক
  const orders: any[] = Array.isArray(ordersData) ? ordersData : [];
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            আজকের বিক্রি, অর্ডার আর প্রোডাক্ট এক নজরে।
          </p>
        </div>
      </div>

      {/* Top stats cards */}
      {statsLoading && <p>Loading stats...</p>}
      {statsError && (
        <p className="text-red-400">ড্যাশবোর্ড ডাটা লোড করতে সমস্যা হচ্ছে</p>
      )}

      {stats && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs text-slate-400">মোট অর্ডার</p>
              <p className="mt-2 text-2xl font-semibold">
                {formatNumber(stats.totalOrders)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Pending: {formatNumber(stats.pendingOrders)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs text-slate-400">ডেলিভারড অর্ডার</p>
              <p className="mt-2 text-2xl font-semibold">
                {formatNumber(stats.deliveredOrders)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Confirmed: {formatNumber(stats.confirmedOrders)} · Shipped:{" "}
                {formatNumber(stats.shippedOrders)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs text-slate-400">মোট প্রোডাক্ট</p>
              <p className="mt-2 text-2xl font-semibold">
                {formatNumber(stats.totalProducts)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Total stock: {formatNumber(stats.totalStock)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs text-slate-400">মোট বিক্রি (approx)</p>
              <p className="mt-2 text-2xl font-semibold">
                {formatMoney(stats.totalRevenue)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Product price × quantity থেকে হিসাব।
              </p>
            </div>
          </div>

          {/* Middle: status bar */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <p className="text-xs text-slate-400">Pending</p>
              <p className="mt-2 text-xl font-semibold">
                {formatNumber(stats.pendingOrders)}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-800 bg-emerald-950/20 p-4">
              <p className="text-xs text-emerald-300">Confirmed</p>
              <p className="mt-2 text-xl font-semibold text-emerald-300">
                {formatNumber(stats.confirmedOrders)}
              </p>
            </div>
            <div className="rounded-xl border border-sky-800 bg-sky-950/20 p-4">
              <p className="text-xs text-sky-300">Shipped</p>
              <p className="mt-2 text-xl font-semibold text-sky-300">
                {formatNumber(stats.shippedOrders)}
              </p>
            </div>
            <div className="rounded-xl border border-red-800 bg-red-950/20 p-4">
              <p className="text-xs text-red-300">Cancelled</p>
              <p className="mt-2 text-xl font-semibold text-red-300">
                {formatNumber(stats.cancelledOrders)}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Recent orders table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">সাম্প্রতিক অর্ডার</h2>
        </div>

        {ordersLoading && <p>অর্ডার লোড হচ্ছে...</p>}

        {!ordersLoading && (
          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="min-w-[700px] w-full text-xs sm:text-sm">
              <thead className="bg-slate-900/60">
                <tr>
                  <th className="p-2 text-left">Time</th>
                  <th className="p-2 text-left">Customer</th>
                  <th className="p-2 text-left">Phone</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                {recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td className="p-2">{formatDate(o.createdAt)}</td>
                    <td className="p-2">
                      <div className="font-medium">{o.fullName}</div>
                      {o.email && (
                        <div className="text-[11px] text-slate-400">
                          {o.email}
                        </div>
                      )}
                    </td>
                    <td className="p-2">{o.phone}</td>
                    <td className="p-2 capitalize">{o.status}</td>
                    <td className="p-2">{o.source || "-"}</td>
                  </tr>
                ))}

                {recentOrders.length === 0 && (
                  <tr>
                    <td
                      className="p-4 text-center text-slate-400 text-xs sm:text-sm"
                      colSpan={5}
                    >
                      কোনো অর্ডার পাওয়া যায়নি।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
