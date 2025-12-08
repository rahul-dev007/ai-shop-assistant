"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/admin/products");
    } else {
      setError("Invalid email or password");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-950 border border-slate-700 rounded-xl px-6 py-8 w-full max-w-sm space-y-4 shadow-lg"
      >
        <h1 className="text-xl font-semibold text-center mb-2">
          Admin Login
        </h1>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            name="email"
            type="email"
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
            placeholder="admin@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            name="password"
            type="password"
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-950/40 border border-red-700 rounded px-2 py-1">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full mt-2 rounded-md border border-sky-500 bg-sky-500/10 py-2 text-sm font-medium hover:bg-sky-500/20 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
