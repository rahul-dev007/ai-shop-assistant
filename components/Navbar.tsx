"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Logo + Name */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold text-slate-900">
            HB
          </div>
          <div>
            <div className="text-sm font-semibold">
              {isAdminRoute ? "Hope Boutique · Admin" : "Hope Boutique"}
            </div>
            <div className="text-[11px] text-slate-300 hidden xs:block">
              {isAdminRoute
                ? "Admin Control Panel"
                : "Facebook AI Shopping Assistant"}
            </div>
          </div>
        </div>

        {/* Nav + Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* ---------- ADMIN NAV ---------- */}
          {isAdminRoute ? (
            <>
              <nav className="flex flex-wrap gap-2 text-[11px] sm:text-xs font-medium">
                <Link
                  href="/admin"
                  className={`px-3 py-1 rounded-full border transition ${pathname === "/admin"
                    ? "bg-emerald-500 text-slate-900 border-emerald-500"
                    : "bg-emerald-500/10 text-emerald-300 border-emerald-500/60 hover:bg-emerald-500 hover:text-slate-900"
                    }`}
                >
                  Dashboard
                </Link>

                <Link
                  href="/admin/products"
                  className={`px-3 py-1 rounded-full border transition ${pathname.startsWith("/admin/products")
                    ? "bg-sky-500 text-slate-900 border-sky-500"
                    : "bg-sky-500/10 text-sky-300 border-sky-500/60 hover:bg-sky-500 hover:text-slate-900"
                    }`}
                >
                  Products
                </Link>

                <Link
                  href="/admin/orders"
                  className={`px-3 py-1 rounded-full border transition ${pathname.startsWith("/admin/orders")
                    ? "bg-violet-500 text-slate-900 border-violet-500"
                    : "bg-violet-500/10 text-violet-300 border-violet-500/60 hover:bg-violet-500 hover:text-slate-900"
                    }`}
                >
                  Orders
                </Link>

                
                <Link
                  href="/admin/chats"
                  className={`px-3 py-1 rounded-full border transition ${pathname.startsWith("/admin/orders")
                    ? "bg-violet-500 text-slate-900 border-violet-500"
                    : "bg-violet-500/10 text-violet-300 border-violet-500/60 hover:bg-violet-500 hover:text-slate-900"
                    }`}
                >
                  chats
                </Link>
              </nav>

              {/* Admin side extra button (optional) */}
              <Link
                href="/"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-1.5 rounded-full shadow bg-slate-800 text-slate-100 font-semibold transition text-xs sm:text-sm hover:bg-slate-700"
              >
                View Shop
              </Link>
              
                <Link
                  href="/admin/login"
                  className={`px-3 py-1 rounded-full border transition ${pathname.startsWith("/admin/orders")
                    ? "bg-violet-500 text-slate-900 border-violet-500"
                    : "bg-violet-500/10 text-violet-300 border-violet-500/60 hover:bg-violet-500 hover:text-slate-900"
                    }`}
                >
                  login
                </Link>

            </>
          ) : (
            /* ---------- USER NAV (default) ---------- */
            <>
              <nav className="flex flex-wrap gap-2 text-[11px] sm:text-xs font-medium">
                <Link
                  href="/"
                  className={`px-3 py-1 rounded-full border transition ${pathname === "/"
                    ? "bg-emerald-500 text-slate-900 border-emerald-500"
                    : "bg-emerald-500/10 text-emerald-300 border-emerald-500/60 hover:bg-emerald-500 hover:text-slate-900"
                    }`}
                >
                  Home
                </Link>

                <Link
                  href="/#products"
                  className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/60 hover:bg-sky-500 hover:text-slate-900 transition"
                >
                  Products
                </Link>

                <Link
                  href="#about"
                  className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/60 hover:bg-violet-500 hover:text-slate-900 transition"
                >
                  About
                </Link>

                <Link
                  href="#contact"
                  className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/60 hover:bg-rose-500 hover:text-slate-900 transition"
                >
                  Contact
                </Link>
              </nav>

              <Link
                href="/chat"
                className="px-4 py-1.5 rounded-full shadow bg-emerald-500 text-slate-900 font-semibold transition text-xs sm:text-sm hover:bg-emerald-400"
              >
                Chat 💬
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
