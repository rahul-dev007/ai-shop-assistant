// app/api/chat/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getChatSessionModel } from "@/lib/models/ChatSession";
import { getChatMessageModel } from "@/lib/models/ChatMessage";

export async function GET(req: NextRequest) {
  try {
    // 👉 sessionKey কোথা থেকে নেব:
    // 1) query string ?sessionKey=...
    // 2) নইলে cookie: hb_session
    const url = new URL(req.url);
    const querySessionKey = url.searchParams.get("sessionKey");
    const cookieSessionKey = req.cookies.get("hb_session")?.value || null;

    const sessionKey = querySessionKey || cookieSessionKey;

    if (!sessionKey) {
      return NextResponse.json({ messages: [] });
    }

    const ChatSession = await getChatSessionModel();
    const ChatMessage = await getChatMessageModel();

    const session = await ChatSession.findOne({ sessionKey }).lean();
    if (!session) {
      return NextResponse.json({ messages: [] });
    }

    // 🔥 important:
    // এখানে আমরা কোনো senderType filter করছি না
    // user + ai + admin — সবার মেসেজই আসবে
    const messages = await ChatMessage.find(
      { sessionId: session._id },
      "_id role content senderType createdAt" // শুধু দরকারি ফিল্ডগুলো
    )
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      messages: messages.map((m: any) => ({
        _id: m._id.toString(),
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
        senderType: (m.senderType ??
          (m.role === "user" ? "user" : "ai")) as "user" | "ai" | "admin",
        createdAt: m.createdAt,
      })),
    });
  } catch (err: any) {
    console.error("Chat history error:", err);
    return NextResponse.json(
      { error: "Failed to load history", details: err.message },
      { status: 500 }
    );
  }
}
