"use client";

import { useState } from "react";
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "@/lib/adminApi";
import { Pencil, Trash2 } from "lucide-react";

const emptyForm = {
  name_bn: "",
  name_en: "",
  category: "",
  price: "",
  imageUrl: "",
  stock: "",
};

export default function AdminProductsPage() {
  const { data, isLoading, error } = useGetProductsQuery();
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  // data সবসময় array হচ্ছে কিনা → double check
  const products: any[] = Array.isArray(data) ? data : [];

  // 👉 summary calculations
  const totalProducts = products.length || 0;

  const categoryCounts = products.reduce<Record<string, number>>(
    (acc, p: any) => {
      const cat = p.category || "unknown";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    },
    {}
  );

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name_bn: form.name_bn,
      name_en: form.name_en || undefined,
      category: form.category,
      price: Number(form.price),
      imageUrl: form.imageUrl || undefined,
      stock: form.stock ? Number(form.stock) : undefined,
    };

    try {
      if (editingId) {
        await updateProduct({ id: editingId, data: payload }).unwrap();
      } else {
        await createProduct(payload).unwrap();
      }

      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      console.error("Save failed", err);
      alert("প্রোডাক্ট সেভ করতে সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(p: any) {
    setEditingId(p._id);
    setForm({
      name_bn: p.name_bn || "",
      name_en: p.name_en || "",
      category: p.category || "",
      price: String(p.price ?? ""),
      imageUrl: p.imageUrl || "",
      stock: String(p.stock ?? ""),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (!confirm("এই প্রোডাক্টটা ডিলিট করতে চান?")) return;
    try {
      await deleteProduct({ id }).unwrap();
    } catch (err) {
      console.error("Delete failed", err);
      alert("প্রোডাক্ট ডিলিট করতে সমস্যা হয়েছে");
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Top header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-semibold">
          Admin – Products
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-400">
          মোট প্রোডাক্ট:{" "}
          <span className="font-semibold text-slate-100">
            {totalProducts}
          </span>
        </p>
      </div>

      {/* ✅ Category-wise summary bar */}
      <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs">
        {Object.keys(categoryCounts).length === 0 ? (
          <span className="text-slate-500">
            এখনো কোনো ক্যাটাগরিতে প্রোডাক্ট নেই।
          </span>
        ) : (
          Object.entries(categoryCounts).map(([cat, count]) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-slate-200"
            >
              <span className="capitalize">{cat}</span>
              <span className="text-[10px] text-slate-400">
                ({count} product{count > 1 ? "s" : ""})
              </span>
            </span>
          ))
        )}
      </div>

      {/* Add / Edit form */}
      <form
        onSubmit={handleSubmit}
        className="grid gap-3 bg-slate-950/40 border border-slate-800 rounded-xl p-4 md:grid-cols-3"
      >
        <div className="md:col-span-3 flex items-center justify-between mb-1">
          <span className="font-medium text-sm">
            {editingId ? "প্রোডাক্ট এডিট করুন" : "নতুন প্রোডাক্ট যোগ করুন"}
          </span>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="text-[11px] rounded border border-slate-600 px-2 py-1 text-slate-300 hover:bg-slate-800"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-300">নাম (বাংলা)</label>
          <input
            name="name_bn"
            value={form.name_bn}
            onChange={handleChange}
            className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs sm:text-sm"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-300">Name (English)</label>
          <input
            name="name_en"
            value={form.name_en}
            onChange={handleChange}
            className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs sm:text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-300">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs sm:text-sm"
            required
          >
            <option value="">Select…</option>
            <option value="saree">Saree</option>
            <option value="three-piece">Three-piece</option>
            <option value="kurti">Kurti</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-300">Price (৳)</label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs sm:text-sm"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-300">Stock</label>
          <input
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
            className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs sm:text-sm"
          />
        </div>

        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-[11px] text-slate-300">Image URL</label>
          <input
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs sm:text-sm"
          />
        </div>

        <div className="flex gap-2 items-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded border border-sky-500 bg-sky-500/10 px-4 py-1.5 text-xs sm:text-sm font-medium hover:bg-sky-500/20 disabled:opacity-60"
          >
            {editingId ? "Update" : "Add"}
          </button>

          {editingId && (
            <span className="text-[11px] text-slate-400">
              এখন আপনি এডিট মোডে আছেন।
            </span>
          )}
        </div>
      </form>

      {/* Products table */}
      {isLoading && <p className="text-xs sm:text-sm">Loading products...</p>}
      {error && (
        <p className="text-xs sm:text-sm text-red-400">
          Failed to load products
        </p>
      )}

      {!isLoading && !error && (
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="min-w-[720px] w-full text-xs sm:text-sm">
            <thead className="bg-slate-900/60">
              <tr>
                <th className="p-2 text-left">Image</th>
                <th className="p-2 text-left">নাম (BN)</th>
                <th className="p-2 text-left">Name (EN)</th>
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-left">Price</th>
                <th className="p-2 text-left">Stock</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/40">
              {products.map((p) => (
                <tr key={p._id}>
                  <td className="p-2">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name_en || p.name_bn}
                        className="h-10 w-10 rounded-md object-cover border border-slate-700"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md border border-dashed border-slate-700 flex items-center justify-center text-[10px] text-slate-500">
                        No image
                      </div>
                    )}
                  </td>
                  <td className="p-2">{p.name_bn}</td>
                  <td className="p-2">{p.name_en || "-"}</td>
                  <td className="p-2">{p.category}</td>
                  <td className="p-2">৳ {p.price}</td>
                  <td className="p-2">{p.stock ?? 0}</td>
                  <td className="p-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => startEdit(p)}
                        className="inline-flex items-center gap-1 rounded border border-slate-600 px-2 py-1 text-[10px] sm:text-xs hover:bg-slate-800"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="inline-flex items-center gap-1 rounded border border-red-500 px-2 py-1 text-[10px] sm:text-xs text-red-300 hover:bg-red-950/40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td
                    className="p-4 text-center text-slate-400 text-xs sm:text-sm"
                    colSpan={7}
                  >
                    এখনো কোনো প্রোডাক্ট যোগ করা হয়নি।
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
