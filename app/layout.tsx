import "./globals.css";
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import ReduxProvider from "@/components/ReduxProvider";

export const metadata = {
  title: "Hope Boutique · AI Assistant",
  description: "Bangla WhatsApp style AI shopping chat",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bn">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <ReduxProvider>
          <Navbar />

          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
