// app/chat/page.tsx
"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import ChatBubble from "@/components/ChatBubble";
import { getPusherClient } from "@/lib/pusher/client";
import type { ChatAIResponse, Message, PendingOrder, Product } from "@/types/chat";

const OrderForm = dynamic(() => import("@/components/OrderForm"), { ssr: false });
const ProductCard = dynamic(() => import("@/components/ProductCard"), { ssr: false });

// ---------- helpers ----------
function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

function isOrderMessage(text: string) {
  const t = text.toLowerCase();
  return (
    t.includes("order") ||
    t.includes("orde") ||
    t.includes("অর্ডার") ||
    t.includes("nibo") ||
    t.includes("nebo") ||
    t.includes("eta nibo") ||
    t.includes("eta nebo") ||
    t.includes("এটা নিব") ||
    t.includes("i want to take it") ||
    t.includes("i want to buy it") ||
    t.includes("i want to buy") ||
    t.includes("এটা নেব")
  );
}

function isCancelOrderMessage(text: string) {
  const t = text.toLowerCase();
  return (
    t.includes("pore order") ||
    t.includes("later order") ||
    t.includes("pore korbo") ||
    t.includes("পরে করবো") ||
    t.includes("lagbe na") ||
    t.includes("লাগবে না")
  );
}

function formatTime(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("bn-BD", { hour: "numeric", minute: "2-digit" });
}

// ✅ better auto-scroll (render complete তারপর scroll)
function useAutoScroll(dep: unknown) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (smooth = false) => {
    if (!bottomRef.current) return;
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      });
    });
  };

  useEffect(() => {
    scrollToBottom(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep]);

  return { bottomRef, scrollToBottom };
}

function ChatInner() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ order submit হলে product fetch re-run block
  const [orderJustSubmitted, setOrderJustSubmitted] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { bottomRef, scrollToBottom } = useAutoScroll(messages.length);

  // 🧠 sessionKey localStorage থেকে
  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = window.localStorage.getItem("hb_session_key");
    if (existing) {
      setSessionKey(existing);
    } else {
      const newKey = createId();
      window.localStorage.setItem("hb_session_key", newKey);
      setSessionKey(newKey);
    }
  }, []);

  // 📜 chat history load (ONLY ONCE)
  useEffect(() => {
    let cancelled = false;

    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/chat/history");
        if (!res.ok) return;

        const data: {
          messages?: {
            _id: string;
            role: "user" | "assistant" | "system";
            content: string;
            senderType?: "user" | "ai" | "admin";
            createdAt: string;
            aiMeta?: ChatAIResponse;
          }[];
        } = await res.json();

        if (cancelled) return;

        const rows = data.messages ?? [];
        const mapped: Message[] = rows.map((m) => ({
          id: m._id,
          from: m.role === "user" ? "user" : "bot",
          text: m.content,
          senderType: (m.senderType || (m.role === "user" ? "user" : "ai")) as any,
          createdAt: m.createdAt,
          aiMeta: m.aiMeta,
        }));

        setMessages(mapped);
        scrollToBottom(false);
      } catch (e) {
        console.error("History load failed:", e);
      }
    };

    fetchHistory();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔴 Realtime updates via Pusher (SAFE)
  useEffect(() => {
    if (!sessionKey) return;

    const pusher = getPusherClient();
    if (!pusher) {
      // env missing / SSR build → realtime disabled, but app will still work via refresh/history
      return;
    }

    const channelName = `chat-${sessionKey}`;
    const channel = pusher.subscribe(channelName);

    const handler = (payload: {
      _id: string;
      role: "user" | "assistant" | "system";
      senderType?: "user" | "ai" | "admin";
      content: string;
      createdAt: string;
      aiMeta?: ChatAIResponse;
    }) => {
      const incoming: Message = {
        id: payload._id,
        from: payload.role === "user" ? "user" : "bot",
        senderType: (payload.senderType || (payload.role === "user" ? "user" : "ai")) as any,
        text: payload.content,
        createdAt: payload.createdAt,
        aiMeta: payload.aiMeta,
      };

      setMessages((prev) => {
        if (prev.some((m) => m.id === incoming.id)) return prev;

        const next = [...prev, incoming];
        // ✅ stable order (jump কমে)
        next.sort((a, b) => {
          const ta = new Date(a.createdAt).getTime();
          const tb = new Date(b.createdAt).getTime();
          if (ta !== tb) return ta - tb;
          return a.id.localeCompare(b.id);
        });
        return next;
      });
    };

    channel.bind("new-message", handler);

    return () => {
      channel.unbind("new-message", handler);
      pusher.unsubscribe(channelName);
    };
  }, [sessionKey]);

  // 🛒 URL থেকে প্রোডাক্ট লোড করে currentProduct সেট
  useEffect(() => {
    if (orderJustSubmitted) return;

    const id = searchParams.get("productId");
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products?id=${id}`);
        if (!res.ok) return;

        const data = await res.json();
        const p = data.products?.[0] as Product | undefined;

        if (p) {
          setCurrentProduct(p);

          // ✅ product open হলে form ready
          setPendingOrder({
            productId: p.productId,
            quantity: 1,
            productName: p.name_bn,
            price: p.price,
          });

          scrollToBottom(false);
        }
      } catch (e) {
        console.error("Failed to load selected product:", e);
      }
    };

    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, orderJustSubmitted]);

  // 🚀 sendMessage
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");

    const cancelIntent = isCancelOrderMessage(userText);
    const orderIntent = isOrderMessage(userText);

    // ❌ অর্ডার ক্যানসেল
    if (cancelIntent && pendingOrder) {
      setPendingOrder(null);
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          from: "bot",
          senderType: "ai",
          text: "ঠিক আছে আপু, অর্ডারটা ক্যানসেল করে দিলাম 💚 পরে আবার সময় হলে নিতে পারবেন ইনশাআল্লাহ।",
          createdAt: new Date().toISOString(),
        },
      ]);
      scrollToBottom(true);
      return;
    }

    // 🧾 লোকাল order intent → সোজা order form
    if (orderIntent && currentProduct) {
      setPendingOrder({
        productId: currentProduct.productId,
        quantity: 1,
        productName: currentProduct.name_bn,
        price: currentProduct.price,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          from: "bot",
          senderType: "ai",
          text: "ঠিক আছে আপু 🥰 নিচের ফর্মটি পূরণ করে অর্ডারটি কনফার্ম করে দিন।",
          createdAt: new Date().toISOString(),
        },
      ]);
      scrollToBottom(true);
    }

    setLoading(true);

    try {
      const baseMessages = [...messages].map((m) => ({
        role: m.from === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const messagesForApi = [...baseMessages, { role: "user" as const, content: userText }];

      if (currentProduct) {
        messagesForApi.splice(messagesForApi.length - 1, 0, {
          role: "assistant" as const,
          content: `
NOTE FOR AI (DO NOT ECHO TO USER):
User is currently viewing this product:
- Name: ${currentProduct.name_bn}
- Category: ${currentProduct.category}
- Price: ${currentProduct.price} BDT

RULES:
1) User যদি বলে "details bolo", "eta kemon?", "এই প্রোডাক্টটা কেমন?" → শুধু এই product নিয়েই details বলবে।
2) User যদি order নিয়ে কথা বলে, ধরে নেবে এই product ই order করতে চায় (যদি অন্য কিছু clear না করে বলে)।
3) এই product context ভুলে যাবে না, যতক্ষণ না নতুন product select করা হয়।
`,
        });
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messagesForApi,
          sessionKey,
        }),
      });

      if (!res.ok) {
        console.error("Chat API failed:", await res.text());
        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            from: "bot",
            senderType: "ai",
            text: "দুঃখিত, এখন সার্ভারে একটু সমস্যা হচ্ছে 😔 কিছুক্ষণ পর আবার চেষ্টা করবেন।",
            createdAt: new Date().toISOString(),
          },
        ]);
        setLoading(false);
        return;
      }

      const data: ChatAIResponse & { sessionKey?: string } = await res.json();

      if (data.sessionKey && data.sessionKey !== sessionKey) {
        setSessionKey(data.sessionKey);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("hb_session_key", data.sessionKey);
        }
      }

      if (data.intent === "ASK_ORDER_FORM" && data.selected_products?.length) {
        const sel = data.selected_products[0];
        const matchedProduct =
          data.products?.find((p) => p.productId === sel.productId) || currentProduct;

        if (matchedProduct) {
          setCurrentProduct(matchedProduct as Product);
          setPendingOrder({
            productId: matchedProduct.productId,
            quantity: sel.quantity ?? 1,
            productName: matchedProduct.name_bn,
            price: matchedProduct.price,
          });
        }
      }
    } catch (err) {
      console.error("Chat send error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          from: "bot",
          senderType: "ai",
          text: "নেটওয়ার্ক এররের জন্য মেসেজটা পাঠানো যায়নি 😢 একটু পরে আবার চেষ্টা করবেন প্লিজ।",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center p-2 sm:p-4 bg-slate-950">
      <div className="w-full max-w-md sm:max-w-lg bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-emerald-700/95 px-3 py-2 flex items-center gap-2">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-white text-emerald-700 font-bold flex items-center justify-center">
              AI
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-emerald-700" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">Shop Assistant</div>
            <div className="text-[11px] text-emerald-100">online</div>
          </div>
          <div className="text-[18px] text-emerald-100/90">⋮</div>
        </div>

        {/* Chat area */}
        <div
          className="
            flex-1
            overflow-y-auto
            px-3
            py-2
            bg-[url('/chatbot.png')]
            bg-cover bg-center
          "
        >
          {messages.map((m) => (
            <ChatBubble key={m.id} from={m.from}>
              {m.from === "user" && (
                <div className="text-[10px] text-slate-300/80 mb-0.5">Customer</div>
              )}

              {m.senderType === "admin" && m.from === "bot" && (
                <div className="text-[10px] text-amber-300 mb-0.5">Admin</div>
              )}

              <div className="whitespace-pre-line">{m.text}</div>

              {m.createdAt && (
                <div className="mt-1 text-[10px] text-slate-300/70 flex justify-end">
                  {formatTime(m.createdAt)}
                </div>
              )}

              {m.aiMeta?.intent === "SHOW_PRODUCTS" &&
                Array.isArray(m.aiMeta.products) &&
                m.aiMeta.products.length > 0 && (
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    {m.aiMeta.products.map((p) => (
                      <ProductCard key={p.productId} product={p as any} />
                    ))}
                  </div>
                )}
            </ChatBubble>
          ))}

          {messages.length === 0 && (
            <p className="text-center text-xs text-slate-200 mt-10 bg-black/40 inline-block px-3 py-2 rounded-full">
              হ্যালো! প্রথম মেসেজ দিন…
            </p>
          )}

          {loading && (
            <div className="mt-2">
              <ChatBubble from="bot">
                <div className="flex items-center gap-2 text-[11px] text-slate-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>টাইপ হচ্ছে...</span>
                </div>
              </ChatBubble>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ✅ Current Product panel (order submit হলে hidden) */}
        {currentProduct && !orderJustSubmitted && (
          <div className="bg-slate-950 border-t border-slate-800 px-3 py-2">
            <div className="text-[11px] mb-1 text-slate-200">আপনি যে প্রোডাক্টটি দেখছেন 👇</div>
            <ProductCard product={currentProduct as any} />

            <div className="mt-2 text-[11px] text-emerald-200 bg-slate-900/70 rounded-xl px-3 py-1.5">
              আপু/ভাই, যদি{" "}
              <span className="font-semibold">“{currentProduct.name_bn}”</span>{" "}
              প্রোডাক্টটা অর্ডার করতে চান, তাহলে নিচের ফর্মটি পূরণ করে কনফার্ম করে দিন। 🙂
            </div>
          </div>
        )}

        {/* ✅ Order form */}
        {pendingOrder && (
          <OrderForm
            selected={{
              productId: pendingOrder.productId,
              quantity: pendingOrder.quantity,
              productName: pendingOrder.productName,
              price: pendingOrder.price,
            }}
            onSubmitted={() => {
              // ✅ 1) UI clean
              setPendingOrder(null);
              setCurrentProduct(null);

              // ✅ 2) prevent product reload
              setOrderJustSubmitted(true);

              // ✅ 3) URL clean (hard)
              if (typeof window !== "undefined") {
                window.history.replaceState({}, "", "/chat");
              } else {
                router.replace("/chat");
              }

              // ✅ 4) scroll (confirm message pusher দিয়ে আসবে)
              setTimeout(() => scrollToBottom(true), 180);

              // ✅ 5) later allow product load again
              setTimeout(() => setOrderJustSubmitted(false), 800);
            }}
          />
        )}

        {/* Input area */}
        <div className="p-2 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-lg text-slate-300"
          >
            😊
          </button>

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
            className="w-9 h-9 rounded-full bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 flex items-center justify-center text-sm font-semibold"
          >
            {loading ? "…" : "➤"}
          </button>
        </div>
      </div>
    </div>
  );
}

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
