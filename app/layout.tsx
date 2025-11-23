import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Hope Boutique · AI Assistant",
  description: "Bangla WhatsApp style AI shopping chat",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bn">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        {/* Global Navbar top for all pages */}
        <header className="bg-slate-950 border-b border-slate-800">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold text-slate-900">
                HB
              </div>
              <div>
                <div className="text-sm font-semibold">Hope Boutique</div>
                <div className="text-[11px] text-slate-300">
                  Facebook AI Shopping Assistant
                </div>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-200">
              <a href="/" className="hover:text-emerald-400">
                Home
              </a>
              <a href="#products" className="hover:text-emerald-400">
                Products
              </a>
              <a href="#about" className="hover:text-emerald-400">
                About
              </a>
              <a href="#contact" className="hover:text-emerald-400">
                Contact
              </a>
            </nav>

            <a
              href="/chat"
              className="ml-3 px-4 py-1.5 rounded-full bg-emerald-500 text-xs md:text-sm font-semibold text-slate-950 shadow hover:bg-emerald-400 transition"
            >
              Chat 💬
            </a>
          </div>
        </header>

        {/* সব page content এখানে */}
        {children}
      </body>
    </html>
  );
}
