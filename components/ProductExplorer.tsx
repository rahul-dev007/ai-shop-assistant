"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

type UiProduct = {
  productId: string;
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
};

const CATEGORIES = [
  { id: "all", label: "সব প্রোডাক্ট" },
  { id: "three-piece", label: "Three-piece" },
  { id: "saree", label: "শাড়ি" },
  { id: "two-piece", label: "টু-পিস" },
];

export default function ProductExplorer() {
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [products, setProducts] = useState<UiProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (category && category !== "all") {
        params.set("category", category);
      }
      if (search.trim()) {
        params.set("q", search.trim());
      }

      const url =
        "/api/products" + (params.toString() ? `?${params.toString()}` : "");

      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) {
      console.error("Failed to load products:", e);
    } finally {
      setLoading(false);
    }
  };

  // প্রথম লোডে / ক্যাটাগরি বদলালে লোড করব
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Category buttons + search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-[11px]">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full border text-[11px] transition ${
                category === cat.id
                  ? "bg-emerald-500 text-slate-900 border-emerald-500 shadow"
                  : "bg-slate-900 text-slate-200 border-slate-700 hover:border-emerald-500/60 hover:text-emerald-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2 text-[11px]"
        >
          <input
            type="text"
            placeholder="search: red shari, three-piece…"
            className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-[11px] w-full sm:w-56 focus:outline-none focus:border-emerald-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-full bg-emerald-500 text-slate-900 font-semibold hover:bg-emerald-400 transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Product list */}
      <div className="min-h-[80px]">
        {loading && (
          <p className="text-xs text-slate-400">লোড হচ্ছে, একটু অপেক্ষা করুন…</p>
        )}

        {!loading && products.length === 0 && (
          <p className="text-xs text-slate-400">
            কোনো প্রোডাক্ট পাওয়া যায়নি। category বা search পরিবর্তন করে দেখুন।
          </p>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
            {products.map((p) => (
              <Link
                key={p.productId}
                href={`/chat?productId=${p.productId}`}
                className="text-[11px] block"
              >
                <ProductCard product={p as any} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
