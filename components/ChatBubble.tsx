"use client";

import { ReactNode } from "react";

interface ChatBubbleProps {
  from: "user" | "bot";
  name?: string;
  children: ReactNode;
}

export default function ChatBubble({ from, name, children }: ChatBubbleProps) {
  const isUser = from === "user";

  return (
    <div className={`flex mb-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="mr-2 flex items-end">
          <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold">
            AI
          </div>
        </div>
      )}

      <div className={`max-w-[80%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        {name && (
          <span className="text-[10px] text-gray-400 mb-0.5">
            {name}
          </span>
        )}

        <div
          className={
            "px-3 py-2 rounded-2xl shadow-sm text-sm " +
            (isUser
              ? "bg-blue-600 text-white rounded-br-sm"
              : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm")
          }
        >
          {children}
        </div>
      </div>

      {isUser && (
        <div className="ml-2 flex items-end">
          <div className="w-7 h-7 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs font-semibold">
            আপনি
          </div>
        </div>
      )}
    </div>
  );
}
