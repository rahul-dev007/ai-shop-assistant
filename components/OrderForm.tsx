"use client";

import { useState } from "react";

interface OrderFormProps {
  selected: {
    productId: string;
    quantity?: number;
    productName?: string;
    price?: number;
  };
  onSubmitted?: (payload: { orderId?: string; messageBn: string }) => void;
}

export default function OrderForm({ selected, onSubmitted }: OrderFormProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [quantity, setQuantity] = useState(selected.quantity || 1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

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
      } else {
        const msg =
          data.messageBn ||
          "আপনার অর্ডার কনফার্ম হয়েছে, ইনশাআল্লাহ শীঘ্রই কনট্যাক্ট করবো 🥰";

        setMessage(msg);
        setFullName("");
        setPhone("");
        setEmail("");
        setAddress("");

        if (onSubmitted) {
          onSubmitted({ orderId: data.orderId, messageBn: msg });
        }
      }
    } catch (err: any) {
      setError("সার্ভার এরর হয়েছে, আবার চেষ্টা করুন");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-slate-800 p-3 bg-slate-900 text-slate-100 space-y-2">
      <h3 className="font-semibold text-sm mb-1">
        🧾 অর্ডার ফর্ম
        {selected.productName ? ` – ${selected.productName}` : ""}
      </h3>

      {selected.price && (
        <p className="text-xs text-slate-300">
          আনুমানিক দাম: {selected.price} টাকা (প্রতি পিস)
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-2 text-sm">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs mb-1">নাম *</label>
            <input
              className="w-full border border-slate-700 rounded px-2 py-1 text-sm bg-slate-800 text-slate-100"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="আপনার নাম লিখুন"
            />
          </div>
          <div className="w-24">
            <label className="block text-xs mb-1">পরিমাণ</label>
            <input
              type="number"
              min={1}
              className="w-full border border-slate-700 rounded px-2 py-1 text-sm bg-slate-800 text-slate-100"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value) || 1)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs mb-1">মোবাইল নাম্বার *</label>
          <input
            className="w-full border border-slate-700 rounded px-2 py-1 text-sm bg-slate-800 text-slate-100"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="01XXXXXXXXX"
          />
        </div>

        <div>
          <label className="block text-xs mb-1">ইমেইল (optional)</label>
          <input
            type="email"
            className="w-full border border-slate-700 rounded px-2 py-1 text-sm bg-slate-800 text-slate-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label className="block text-xs mb-1">ঠিকানা *</label>
          <textarea
            className="w-full border border-slate-700 rounded px-2 py-1 text-sm bg-slate-800 text-slate-100"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            placeholder="পুরো ঠিকানা লিখুন"
            rows={2}
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}
        {message && <p className="text-xs text-emerald-400">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-1 border border-emerald-500 rounded py-1.5 text-sm font-medium bg-emerald-500 text-slate-950 disabled:opacity-60"
        >
          {loading ? "অর্ডার হচ্ছে..." : "অর্ডার কনফার্ম করুন"}
        </button>
      </form>
    </div>
  );
}
