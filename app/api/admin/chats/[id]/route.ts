// app/api/admin/chats/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminFromRequest } from "@/lib/adminAuth";
import { getChatSessionModel } from "@/lib/models/ChatSession";
import { getChatMessageModel } from "@/lib/models/ChatMessage";
import { Types } from "mongoose";

interface RouteContext {
  params: { id: string };
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  const admin = verifyAdminFromRequest(req);
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = ctx.params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);

    // ✅ default limit 200 (admin UI fast)
    const limitRaw = Number(searchParams.get("limit") || 200);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), 500) // 1..500 clamp
      : 200;

    // ✅ optional: load messages before a timestamp (pagination)
    const before = searchParams.get("before"); // ISO string
    const beforeDate = before ? new Date(before) : null;
    const useBefore = beforeDate && !isNaN(beforeDate.getTime());

    const ChatSession = await getChatSessionModel();
    const ChatMessage = await getChatMessageModel();

    // ✅ projection: only needed fields
    const session = await ChatSession.findById(id)
      .select("sessionKey source aiDisabled createdAt lastMessageAt")
      .lean();

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // ✅ query + projection for messages
    const msgQuery: any = { sessionId: session._id };
    if (useBefore) {
      msgQuery.createdAt = { $lt: beforeDate };
    }

    // Fetch latest `limit` messages (desc), then reverse for UI chronological view
    const docs = await ChatMessage.find(
      msgQuery,
      "_id role senderType content createdAt"
    )
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const messages = docs.reverse();

    return NextResponse.json({
      session: {
        _id: session._id.toString(),
        sessionKey: session.sessionKey,
        source: session.source,
        aiDisabled: !!(session as any).aiDisabled,
        createdAt: (session as any).createdAt,
        lastMessageAt: (session as any).lastMessageAt,
      },
      messages: messages.map((m: any) => ({
        _id: m._id.toString(),
        role: m.role as "user" | "assistant" | "system",
        senderType:
          (m.senderType || (m.role === "user" ? "user" : "ai")) as
            | "user"
            | "ai"
            | "admin",
        content: m.content,
        createdAt: m.createdAt,
      })),
      pageInfo: {
        limit,
        hasMore: docs.length === limit, // rough indicator
        before: useBefore ? beforeDate!.toISOString() : null,
        oldestMessageAt:
          messages.length > 0 ? messages[0].createdAt : null,
        newestMessageAt:
          messages.length > 0 ? messages[messages.length - 1].createdAt : null,
      },
    });
  } catch (err: any) {
    console.error("Admin chat detail error:", err);
    return NextResponse.json(
      { error: "Failed to load chat detail", details: err.message },
      { status: 500 }
    );
  }
}
