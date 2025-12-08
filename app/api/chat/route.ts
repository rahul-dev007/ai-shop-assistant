// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";
import { findCandidateProducts } from "@/lib/productSearch";
import { ChatAIResponse } from "@/types/chat";

import { getChatSessionModel } from "@/lib/models/ChatSession";
import { getChatMessageModel } from "@/lib/models/ChatMessage";

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

    // ✅ সবসময় শেষের user মেসেজটাই ধরব (hidden product note assistant role এ থাকবে)
    const lastUserIndex = [...messages].map((m) => m.role).lastIndexOf("user");

    if (lastUserIndex === -1) {
      return NextResponse.json(
        { error: "No user message found" },
        { status: 400 }
      );
    }

    const userMessage = messages[lastUserIndex].content;
    const previousMessages = messages.slice(0, lastUserIndex);

    // -----------------------------
    // 1) Session + Message models
    // -----------------------------
    const ChatSession = await getChatSessionModel();
    const ChatMessage = await getChatMessageModel();

    // body → cookie → নতুন random key
    let sessionKey =
      bodySessionKey ||
      req.cookies.get("hb_session")?.value ||
      crypto.randomUUID();

    // session find / create
    let session = await ChatSession.findOne({ sessionKey });

    if (!session) {
      session = await ChatSession.create({
        sessionKey,
        source: "website",
      });
    }

    // ⭐ শুধু pure user message save করব
    await ChatMessage.create({
      sessionId: session._id,
      role: "user",
      senderType: "user",
      content: userMessage,
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
    // 3) DB থেকে candidate products এনে AI কল
    // -----------------------------
    const candidates = await findCandidateProducts(userMessage);

    let aiResponse: ChatAIResponse = await callGemini(
      userMessage,
      candidates,
      previousMessages
    );

    // Canonical product list – সব সময় DB থেকে
    const canonicalProducts = candidates.map((c) => ({
      productId: c.productId,
      name_bn: c.name_bn,
      price: c.price,
      imageUrl: c.imageUrl,
    }));

    // AI যা products পাঠাক, আমরা canonical দিয়ে override করছি
    (aiResponse as any).products = canonicalProducts;

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
    // 4) AI reply text DB তে save (pure Bangla)
    // -----------------------------
    const assistantText =
      (aiResponse as any).reply_bn ||
      (aiResponse as any).answer ||
      (aiResponse as any).reply ||
      (aiResponse as any).message ||
      "…";

    await ChatMessage.create({
      sessionId: session._id,
      role: "assistant",
      senderType: "ai",
      content: assistantText,
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
        maxAge: 60 * 60 * 24 * 30, // 30 দিন
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
