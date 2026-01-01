// app/api/chat/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getChatSessionModel } from "@/lib/models/ChatSession";
import { getChatMessageModel } from "@/lib/models/ChatMessage";

// ✅ Vercel/Next static render error fix
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    // 1) query string ?sessionKey=...
    // 2) cookie hb_session
    const querySessionKey = url.searchParams.get("sessionKey");
    const cookieSessionKey = req.cookies.get("hb_session")?.value || null;
    const sessionKey = querySessionKey || cookieSessionKey;

    // ✅ limit + before (pagination)
    const limitRaw = Number(url.searchParams.get("limit") || 100);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), 300)
      : 100;

    const before = url.searchParams.get("before");
    const beforeDate = before ? new Date(before) : null;
    const useBefore = beforeDate && !isNaN(beforeDate.getTime());

    if (!sessionKey) {
      return NextResponse.json({ messages: [] });
    }

    const ChatSession = await getChatSessionModel();
    const ChatMessage = await getChatMessageModel();

    const session = await ChatSession.findOne({ sessionKey })
      .select("_id")
      .lean();

    if (!session) {
      return NextResponse.json({ messages: [] });
    }

    const query: any = { sessionId: session._id };
    if (useBefore) query.createdAt = { $lt: beforeDate };

    // ✅ latest N messages, then reverse for chronological UI
    const docs = await ChatMessage.find(
      query,
      "_id role content senderType createdAt"
    )
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const messages = docs.reverse();

    return NextResponse.json({
      messages: messages.map((m: any) => ({
        _id: m._id.toString(),
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
        senderType: (m.senderType ??
          (m.role === "user" ? "user" : "ai")) as "user" | "ai" | "admin",
        createdAt: m.createdAt,
      })),
      pageInfo: {
        limit,
        hasMore: docs.length === limit,
        before: useBefore ? beforeDate!.toISOString() : null,
        oldestMessageAt: messages.length ? messages[0].createdAt : null,
        newestMessageAt: messages.length
          ? messages[messages.length - 1].createdAt
          : null,
      },
    });
  } catch (err: any) {
    console.error("Chat history error:", err);
    return NextResponse.json(
      { error: "Failed to load history", details: err.message },
      { status: 500 }
    );
  }
}
