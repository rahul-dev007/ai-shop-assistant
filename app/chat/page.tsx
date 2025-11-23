"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import OrderForm from "@/components/OrderForm";
import ProductCard from "@/components/ProductCard";
import ChatBubble from "@/components/ChatBubble";
import { ChatAIResponse } from "@/types/chat";

export const dynamic = "force-dynamic"; // ⭐ এটা নতুন

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

interface SelectedProduct {
  productId: string;
  name_bn: string;
  name_en?: string;
  category: string;
  price: number;
  tags: string[];
  imageUrl?: string;
  description_bn?: string;
  colors?: string[];
  sizes?: string[];
  stock?: number;
}

// ✅ safe ID generator – SSR এও কাজ করবে
function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(
    null
  );

  const searchParams = useSearchParams();

  // 🔥 URL থেকে productId নিয়ে প্রোডাক্ট লোড করি
  useEffect(() => {
    const id = searchParams.get("productId");
    if (!id) return;

    const fetchSelectedProduct = async () => {
      try {
        const res = await fetch(`/api/products?id=${id}`);
        if (!res.ok) return;

        const data = await res.json();
        const p = data.products?.[0];

        if (p) {
          setSelectedProduct(p);

          // যদি আগে কোনো মেসেজ না থাকে, একটা ছোট গাইড মেসেজ দেই
          setMessages((prev) =>
            prev.length
              ? prev
              : [
                  {
                    id: createId(),
                    from: "bot",
                    text:
                      "এই প্রোডাক্ট সম্পর্কে কিছু জানতে চাইলে লিখুন, আর অর্ডার করতে চাইলে লিখুন: apu eta order dibo 💚",
                  },
                ]
          );
        }
      } catch (e) {
        console.error("Failed to load selected product from URL:", e);
      }
    };

    fetchSelectedProduct();
  }, [searchParams]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const newUserMsg: Message = {
      id: createId(),
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
            id: createId(),
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
        id: createId(),
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
          {/* Products পেজ থেকে আসা সিলেক্টেড প্রোডাক্টকে প্রথম bubble হিসেবে দেখাই */}
          {selectedProduct && (
            <ChatBubble from="bot">
              <div className="text-[11px] mb-2">
                আপনি এই প্রোডাক্ট থেকে এসেছেন 👇
              </div>
              <ProductCard product={selectedProduct as any} />
            </ChatBubble>
          )}

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

          {/* শুধু তখনই initial text দেখাবো, যখন কোনো product ও message দুটোরই কিছু নাই */}
          {messages.length === 0 && !selectedProduct && (
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
                  id: createId(),
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
