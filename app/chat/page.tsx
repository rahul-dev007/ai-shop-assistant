"use client";

import { useState } from "react";
import OrderForm from "@/components/OrderForm";
import ProductCard from "@/components/ProductCard";
import ChatBubble from "@/components/ChatBubble";
import { ChatAIResponse } from "@/types/chat";

interface Message {
  id: string;
  from: "user" | "bot";
  text: string;
  aiMeta?: ChatAIResponse;
}

interface PendingOrder {
  productId: string;
  quantity?: number;
  productName?: string;
  price?: number;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const newUserMsg: Message = {
      id: crypto.randomUUID(),
      from: "user",
      text: input,
    };

    const newMessages = [...messages, newUserMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: newMessages.map((m) => ({
          role: m.from === "user" ? "user" : "assistant",
          content: m.text,
        })),
      }),
    });

    const data: ChatAIResponse = await res.json();

    if (data.intent === "ASK_ORDER_FORM" && data.selected_products?.length) {
      const sel = data.selected_products[0];

      const matchedProduct = data.products?.find(
        (p: any) => p.productId === sel.productId
      );

      if (!matchedProduct) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            from: "bot",
            text:
              "দুঃখিত, কোন নির্দিষ্ট প্রোডাক্ট বুঝতে পারিনি। আবার যে প্রোডাক্টটা চান, তার নাম লিখে বলবেন?",
          },
        ]);
        setLoading(false);
        return;
      }

      setPendingOrder({
        productId: matchedProduct.productId, // ✅ DB id নিশ্চিত
        quantity: sel.quantity ?? 1,
        productName: matchedProduct.name_bn,
        price: matchedProduct.price,
      });
    }

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        from: "bot",
        text: data.reply_bn,
        aiMeta: data,
      },
    ]);

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center p-2 sm:p-4 bg-slate-950">
      <div className="w-full max-w-md sm:max-w-lg bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {/* inner header like WhatsApp */}
        <div className="bg-emerald-700 px-3 py-2 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white text-emerald-700 font-bold flex items-center justify-center">
            AI
          </div>
          <div>
            <div className="text-sm font-semibold">Shop Assistant</div>
            <div className="text-[11px] text-emerald-100">online</div>
          </div>
        </div>

        {/* chat area */}
        <div
          className="
            h-[60vh] sm:h-[70vh]
            overflow-y-auto
            p-3
            bg-[url('/chatbot.png')]
            bg-cover bg-center
          "
        >
          {messages.map((m) => (
            <ChatBubble key={m.id} from={m.from}>
              {m.text}

              {m.aiMeta?.intent === "SHOW_PRODUCTS" &&
                m.aiMeta.products?.map((p) => (
                  <div key={p.productId} className="mt-2">
                    <ProductCard product={p} />
                  </div>
                ))}
            </ChatBubble>
          ))}

          {messages.length === 0 && (
            <p className="text-center text-xs text-slate-200 mt-10 bg-black/40 inline-block px-3 py-2 rounded-full">
              হ্যালো! প্রথম মেসেজ দিন…
            </p>
          )}
        </div>

        {/* order form */}
        {pendingOrder && (
          <OrderForm
            selected={pendingOrder}
            onSubmitted={(msg) => {
              setPendingOrder(null);
              setMessages((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  from: "bot",
                  text: msg.messageBn,
                },
              ]);
            }}
          />
        )}

        {/* input */}
        <div className="p-2 bg-slate-900 border-t border-slate-800 flex gap-2">
          <input
            className="flex-1 bg-slate-800 text-slate-100 px-3 py-2 rounded-full text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="মেসেজ লিখুন..."
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 px-4 py-2 rounded-full text-sm font-semibold"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
