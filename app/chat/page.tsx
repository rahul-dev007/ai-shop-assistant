"use client";

import dynamic from "next/dynamic";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import ChatBubble from "@/components/ChatBubble";
import type { ChatAIResponse } from "@/types/chat";

// ⭐ OrderForm আর ProductCard শুধু client-side এ render হবে
const OrderForm = dynamic(() => import("@/components/OrderForm"), {
  ssr: false,
});
const ProductCard = dynamic(() => import("@/components/ProductCard"), {
  ssr: false,
});

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

// ✅ safe ID generator – client + build দুই জায়গায়ই safe
function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

// ✅ common order keyword detector (Bangla + English mix)
function isOrderMessage(text: string) {
  const t = text.toLowerCase();
  return (
    t.includes("order") ||
    t.includes("orde") ||
    t.includes("order dibo") ||
    t.includes("order korbo") ||
    t.includes("orde dibo") ||
    t.includes("orde korbo") ||
    t.includes("অর্ডার") ||
    t.includes("eta nibo") ||
    t.includes("eta nebo") ||
    t.includes("এটা নিব") ||
    t.includes("এটা নেব") ||
    t.includes("niye nibo") ||
    t.includes("nibo")
  );
}

// ✅ "আরো প্রোডাক্ট / অন্য ডিজাইন" keyword detector
function isMoreProductsMessage(text: string) {
  const t = text.toLowerCase();
  return (
    t.includes("aro product") ||
    t.includes("aro prodect") ||
    t.includes("আরো প্রোডাক্ট") ||
    t.includes("আরও প্রোডাক্ট") ||
    t.includes("onno product") ||
    t.includes("onnno product") ||
    t.includes("onno design") ||
    t.includes("আরো ডিজাইন") ||
    t.includes("another product") ||
    t.includes("more product") ||
    t.includes("aro dekhao") ||
    t.includes("aro dakaw") ||
    t.includes("aro dekhbo") ||
    t.includes("আরো দেখাবেন") ||
    t.includes("aro dekhate")
  );
}

// ✅ "order pore korbo / ekhon na" type cancel detector
function isCancelOrderMessage(text: string) {
  const t = text.toLowerCase();
  return (
    t.includes("pore order korbo") ||
    t.includes("pora order korbo") ||
    t.includes("order pore korbo") ||
    t.includes("order pora korbo") ||
    t.includes("later order") ||
    t.includes("later korbo") ||
    t.includes("pore korbo") ||
    t.includes("pora korbo") ||
    t.includes("ekhon na") ||
    t.includes("akhon na") ||
    t.includes("ekhon order korbo na") ||
    t.includes("akhon order korbo na") ||
    t.includes("order bad") ||
    t.includes("order lagbe na") ||
    t.includes("lagbe na")
  );
}

/**
 * আসল চ্যাট লজিক + useSearchParams এখানে থাকবে
 */
function ChatInner() {
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

          // আগে কোনো মেসেজ না থাকলে, প্রোডাক্টের নামসহ গাইড মেসেজ দেই
          setMessages((prev) =>
            prev.length
              ? prev
              : [
                  {
                    id: createId(),
                    from: "bot",
                    text: `আপনি "${p.name_bn}" প্রোডাক্ট থেকে এসেছেন 🥰 এই প্রোডাক্ট সম্পর্কে কিছু জানতে চাইলে লিখুন, আর অর্ডার করতে চাইলে লিখুন: "apu eta order dibo" বা "eta nibo".`,
                  },
                ]
          );
        }
      } catch (e) {
        console.error("Failed to load selected product from URL:", e);
      }
    };

    fetchSelectedProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const cancelOrderIntent = isCancelOrderMessage(userText);
    const moreProductsIntentByUser = isMoreProductsMessage(userText);
    const orderIntentByUser = !cancelOrderIntent && isOrderMessage(userText);

    const newUserMsg: Message = {
      id: createId(),
      from: "user",
      text: userText,
    };

    const newMessages = [...messages, newUserMsg];
    setMessages(newMessages);
    setInput("");

    // 🔹 যদি আগে থেকেই order form খোলা থাকে এবং user বলে "পরে করবো / লাগবে না"
    if (cancelOrderIntent && pendingOrder) {
      setPendingOrder(null);
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          from: "bot",
          text:
            "কোনো সমস্যা নেই আপু 🥰 আপনি চাইলে পরে যেকোনো সময় লিখে আবার অর্ডার করতে পারবেন। এখন যেটা দেখতে চান বা জানতে চান, সেটাও লিখে বলতে পারেন।",
        },
      ]);
      return;
    }

    // 🔹 যদি order form খোলা থাকে এবং user বলে "আরো প্রোডাক্ট / অন্য ডিজাইন দেখান"
    if (moreProductsIntentByUser && pendingOrder) {
      setPendingOrder(null);
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          from: "bot",
          text:
            "ঠিক আছে আপু, আগের অর্ডার ফর্মটা ক্যানসেল করে দিলাম। এখন আবার লিখে বলুন কী ধরনের প্রোডাক্ট দেখতে চান, আমি নতুন ডিজাইন সাজেস্ট করি 🥰",
        },
      ]);
      // return করলাম না → যেন AI-এর কাছেও message যায় এবং নতুন প্রোডাক্ট সাজেস্ট করে
    }

    // 🔹 User order টাইপ কিছু বললে, আর selectedProduct থাকলে → সরাসরি OrderForm
    if (orderIntentByUser && selectedProduct) {
      setPendingOrder({
        productId: selectedProduct.productId,
        quantity: 1,
        productName: selectedProduct.name_bn,
        price: selectedProduct.price,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          from: "bot",
          text: "ঠিক আছে আপু, নিচের ফর্মটি পূরণ করে অর্ডার কনফার্ম করে দিন 🥰",
        },
      ]);

      return;
    }

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

    let orderHandled = false;

    // 🔹 ১ম প্রায়োরিটি: AI যদি নিজে থেকে ASK_ORDER_FORM দেয়
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

      orderHandled = true;
    }

    // 🔹 ২য়: AI intent না দিলেও, user order মেসেজ দিলে fallback
    if (!orderHandled && orderIntentByUser) {
      let fallbackProduct: any = null;

      if (selectedProduct) {
        fallbackProduct = selectedProduct;
      } else if (data.products && data.products.length === 1) {
        fallbackProduct = data.products[0];
      }

      if (fallbackProduct) {
        setPendingOrder({
          productId: fallbackProduct.productId,
          quantity: 1,
          productName: fallbackProduct.name_bn,
          price: fallbackProduct.price,
        });

        orderHandled = true;
      }
    }

    // 🔹 Chat message add করি (AI reply)
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
                    <ProductCard product={p as any} />
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

/**
 * এখান থেকে আমরা শুধু Suspense wrapper দিচ্ছি,
 * যাতে useSearchParams hook Suspense boundary এর ভিতরে চলে।
 */
export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 text-sm">
          Chat loading...
        </div>
      }
    >
      <ChatInner />
    </Suspense>
  );
}
