"use client";

import type { ReactNode } from "react";

export default function ChatBubble({
  from,
  children,
}: {
  from: "user" | "bot";
  children: ReactNode;
}) {
  const isUser = from === "user";

  return (
    <div className={`mb-3 flex ${isUser ? "justify-end" : "justify-start"}`}>
      {/* Bot avatar (শুধু bot এর জন্য) */}
      {!isUser && (
        <div className="mr-2 flex flex-col items-center">
          <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-[11px] font-bold text-slate-900">
            AI
          </div>
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 shadow text-[12px] leading-relaxed ${
          isUser
            ? "bg-emerald-500 text-slate-900 rounded-br-sm"
            : "bg-slate-900/85 text-slate-50 rounded-bl-sm"
        }`}
      >
        {/* Name label */}
        {isUser ? (
          <div className="text-[10px] text-slate-800/80 mb-1 text-right font-semibold">
            আপনি
          </div>
        ) : (
          <div className="text-[10px] text-emerald-300 mb-1 font-semibold">
            Shop Assistant
          </div>
        )}

        {/* Message body */}
        <div>{children}</div>
      </div>=
    </div>
  );
}
