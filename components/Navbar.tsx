"use client";

export default function Navbar() {
  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Logo + Name */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold text-slate-900">
            HB
          </div>
          <div>
            <div className="text-sm font-semibold">Hope Boutique</div>
            <div className="text-[11px] text-slate-300 hidden xs:block">
              Facebook AI Shopping Assistant
            </div>
          </div>
        </div>

        {/* Nav + Chat button (mobile + desktop both) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="flex flex-wrap gap-2 text-[11px] sm:text-xs font-medium">
            <a
              href="/"
              className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/60 hover:bg-emerald-500 hover:text-slate-900 transition"
            >
              Home
            </a>
            <a
              href="#products"
              className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/60 hover:bg-sky-500 hover:text-slate-900 transition"
            >
              Products
            </a>
            <a
              href="#about"
              className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/60 hover:bg-violet-500 hover:text-slate-900 transition"
            >
              About
            </a>
            <a
              href="#contact"
              className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/60 hover:bg-rose-500 hover:text-slate-900 transition"
            >
              Contact
            </a>
          </nav>

          <a
            href="/chat"
            className="px-4 py-1.5 rounded-full shadow bg-emerald-500 text-slate-900 font-semibold transition text-xs sm:text-sm hover:bg-emerald-400"
          >
            Chat 💬
          </a>
        </div>
      </div>
    </header>
  );
}
