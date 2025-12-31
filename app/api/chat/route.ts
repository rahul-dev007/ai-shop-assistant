// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";
import { findCandidateProducts } from "@/lib/productSearch";
import type { ChatAIResponse } from "@/types/chat";

import { getChatSessionModel } from "@/lib/models/ChatSession";
import { getChatMessageModel } from "@/lib/models/ChatMessage";

import { pusherServer } from "@/lib/pusher/server";

// ✅ helper: user "show products" command detect
function isShowProductsCommand(text: string) {
  const t = (text || "").trim().toLowerCase();
  return (
    t === "show" ||
    t === "show me" ||
    t.includes("show product") ||
    t.includes("show products") ||
    t === "products" ||
    t.includes("products") ||
    t.includes("দেখাও") ||
    t.includes("দেখান") ||
    t.includes("প্রোডাক্ট দেখাও") ||
    t.includes("পণ্য দেখাও") ||
    t.includes("সব দেখাও")
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { messages, sessionKey: bodySessionKey } = body as {
      messages: { role: "user" | "assistant"; content: string }[];
      sessionKey?: string;
    };

    if (!messages || !messages.length) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    const lastUserIndex = [...messages].map((m) => m.role).lastIndexOf("user");
    if (lastUserIndex === -1) {
      return NextResponse.json(
        { error: "No user message found" },
        { status: 400 }
      );
    }

    const userMessage = messages[lastUserIndex].content;
    const previousMessages = messages.slice(0, lastUserIndex);

    const ChatSession = await getChatSessionModel();
    const ChatMessage = await getChatMessageModel();

    let sessionKey =
      bodySessionKey ||
      req.cookies.get("hb_session")?.value ||
      crypto.randomUUID();

    let session = await ChatSession.findOne({ sessionKey });
    if (!session) {
      session = await ChatSession.create({
        sessionKey,
        source: "website",
      });
    }

    // ⭐ save user message
    const savedUserMsg = await ChatMessage.create({
      sessionId: session._id,
      role: "user",
      senderType: "user",
      content: userMessage,
    });

    // ✅ PUSHER: user message realtime broadcast
    await pusherServer.trigger(`chat-${sessionKey}`, "new-message", {
      _id: savedUserMsg._id.toString(),
      role: "user",
      senderType: "user",
      content: savedUserMsg.content,
      createdAt: savedUserMsg.createdAt,
    });

    // -----------------------------
    // 2) AI pause check (admin panel)
    // -----------------------------
    if (session.aiDisabled) {
      session.lastMessageAt = new Date();
      await session.save();

      return NextResponse.json({
        reply_bn: "",
        intent: "NONE",
        products: [],
        selected_products: [],
        sessionKey,
      });
    }

    // -----------------------------
    // 3) candidates + AI
    // -----------------------------
    const candidates = await findCandidateProducts(userMessage);

    let aiResponse: ChatAIResponse = await callGemini(
      userMessage,
      candidates,
      previousMessages
    );

    // Canonical product list – সব সময় DB থেকে (AI override)
    const canonicalProducts = candidates.map((c) => ({
      productId: c.productId,
      name_bn: c.name_bn,
      name_en: (c as any).name_en,
      category: (c as any).category,
      price: c.price,
      imageUrl: c.imageUrl,
      tags: (c as any).tags,
      stock: (c as any).stock,
    }));

    (aiResponse as any).products = canonicalProducts;

    // ✅ Bonus: user "show/show me/দেখাও" বললে SHOW_PRODUCTS force
    if (isShowProductsCommand(userMessage)) {
      aiResponse.intent = "SHOW_PRODUCTS";
    }

    // selected_products sanitize
    if (aiResponse.selected_products && aiResponse.selected_products.length > 0) {
      const validatedSelections =
        aiResponse.selected_products
          .map((sel) => {
            const matched = canonicalProducts.find(
              (p) => p.productId === sel.productId
            );
            if (!matched) return null;

            return {
              productId: matched.productId,
              quantity: sel.quantity && sel.quantity > 0 ? sel.quantity : 1,
            };
          })
          .filter(Boolean) as { productId: string; quantity: number }[];

      if (validatedSelections.length === 0) {
        aiResponse.selected_products = [];
        if (aiResponse.intent === "ASK_ORDER_FORM") {
          aiResponse.intent = "SHOW_PRODUCTS";
        }
      } else {
        aiResponse.selected_products = validatedSelections;
      }
    }

    // -----------------------------
    // 4) assistant text save
    // -----------------------------
    const assistantText =
      (aiResponse as any).reply_bn ||
      (aiResponse as any).answer ||
      (aiResponse as any).reply ||
      (aiResponse as any).message ||
      "…";

    const savedAiMsg = await ChatMessage.create({
      sessionId: session._id,
      role: "assistant",
      senderType: "ai",
      content: assistantText,
    });

    // ✅ PUSHER: assistant message realtime broadcast (WITH aiMeta)
    await pusherServer.trigger(`chat-${sessionKey}`, "new-message", {
      _id: savedAiMsg._id.toString(),
      role: "assistant",
      senderType: "ai",
      content: savedAiMsg.content,
      createdAt: savedAiMsg.createdAt,

      // 🔥 KEY FIX: UI cards/rendering এর জন্য meta পাঠাচ্ছি
      aiMeta: {
        reply_bn: (aiResponse as any).reply_bn || assistantText,
        intent: aiResponse.intent || "NONE",
        products: (aiResponse as any).products || [],
        selected_products: aiResponse.selected_products || [],
      },
    });

    session.lastMessageAt = new Date();
    await session.save();

    // -----------------------------
    // 5) Response + cookie
    // -----------------------------
    const res = NextResponse.json({
      ...aiResponse,
      sessionKey,
    });

    if (!req.cookies.get("hb_session")) {
      res.cookies.set("hb_session", sessionKey, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }

    return res;
  } catch (err: any) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Chat error", details: err.message },
      { status: 500 }
    );
  }
}
