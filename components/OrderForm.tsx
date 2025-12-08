// components/OrderForm.tsx
"use client";

import { useState } from "react";

interface OrderFormProps {
  selected: {
    productId: string;
    quantity?: number;
    productName?: string;
    price?: number;
  };
  // success hole parent ke just notify (form close korar jonno)
  onSubmitted?: () => void;
}

export default function OrderForm({ selected, onSubmitted }: OrderFormProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [quantity, setQuantity] = useState(selected.quantity || 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selected.productId,
          quantity,
          fullName,
          phone,
          email,
          address,
          source: "facebook",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "অর্ডার করতে সমস্যা হয়েছে");
        return;
      }

      // ✅ এখান থেকে chat message backend already handle করেছে
      // আমরা শুধু local form reset + parent notify করব
      setFullName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setQuantity(selected.quantity || 1);

      onSubmitted?.();
    } catch (err: any) {
      console.error("Order submit error:", err);
      setError("সার্ভার এরর হয়েছে, আবার চেষ্টা করুন");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-slate-800 bg-slate-950/95 px-3 py-2">
      <div className="text-[11px] text-slate-200 mb-1">
        আপনি{" "}
        <span className="font-semibold text-emerald-300">
          “{selected.productName || "সিলেক্ট করা প্রোডাক্ট"}”
        </span>{" "}
        প্রোডাক্টটির অর্ডার কনফার্ম করতে যাচ্ছেন 👇
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 space-y-2 text-[11px]"
      >
        <div className="font-semibold text-slate-100 mb-1">
          🧾 অর্ডার ফর্ম
          {selected.productName ? ` – ${selected.productName}` : ""}
        </div>

        {selected.price && (
          <div className="text-slate-400 mb-1">
            আনুমানিক দাম:{" "}
            <span className="font-semibold text-emerald-300">
              {selected.price} টাকা
            </span>{" "}
            (প্রতি পিস)
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="block text-slate-300">নাম *</label>
            <input
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1.5 text-[11px]"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="আপনার নাম লিখুন"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-slate-300">পরিমাণ</label>
            <input
              type="number"
              min={1}
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1.5 text-[11px]"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, Number(e.target.value) || 1))
              }
            />
          </div>

          <div className="space-y-1">
            <label className="block text-slate-300">মোবাইল নাম্বার *</label>
            <input
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1.5 text-[11px]"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="01XXXXXXXXX"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-slate-300">ইমেইল (optional)</label>
            <input
              type="email"
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1.5 text-[11px]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-slate-300">ঠিকানা *</label>
          <textarea
            className="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-1.5 text-[11px] min-h-[60px]"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            placeholder="পুরো ঠিকানা লিখুন"
          />
        </div>

        {error && (
          <p className="text-[10px] text-red-400 mt-1">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full rounded-full bg-emerald-500 text-slate-900 font-semibold py-1.5 text-[11px] hover:bg-emerald-400 disabled:opacity-60"
        >
          {loading ? "অর্ডার হচ্ছে..." : "অর্ডার কনফার্ম করুন"}
        </button>

        <p className="mt-1 text-[10px] text-slate-400">
          আর এমন আরো ডিজাইন বা অন্য কালার দেখতে চাইলে আমাকে মেসেজে লিখুন —
          যেমন{" "}
          <span className="text-emerald-300">
            "aro design dakhao" / "onno color dekhai"
          </span>{" "}
          💚
        </p>
      </form>
    </div>
  );
}
