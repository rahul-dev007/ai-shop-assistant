// app/api/admin/chats/[id]/reply/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminFromRequest } from "@/lib/adminAuth";
import { getChatSessionModel } from "@/lib/models/ChatSession";
import { getChatMessageModel } from "@/lib/models/ChatMessage";
import { Types } from "mongoose";
import { pusherServer } from "@/lib/pusher/server";

interface RouteContext {
  params: { id: string };
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const admin = verifyAdminFromRequest(req);
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = ctx.params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
    }

    const body = await req.json();
    const { content } = body as { content: string };

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const ChatSession = await getChatSessionModel();
    const ChatMessage = await getChatMessageModel();

    const session = await ChatSession.findById(id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // ✅ Admin reply – role: "assistant", senderType: "admin"
    const msg = await ChatMessage.create({
      sessionId: session._id,
      role: "assistant",
      senderType: "admin",
      content: content.trim(),
    });

    // ✅ IMPORTANT FIX:
    // আপনার main chat API `session.aiDisabled` check করে।
    // তাই admin reply দিলে AI off করতে চাইলে `aiDisabled = true` করতে হবে।
    session.aiDisabled = true;
    session.lastMessageAt = new Date();
    await session.save();

    // ✅ Realtime broadcast to the website chat (customer UI)
    // Channel name matches your chat page: `chat-${sessionKey}`
    await pusherServer.trigger(`chat-${session.sessionKey}`, "new-message", {
      _id: msg._id.toString(),
      role: msg.role, // "assistant"
      senderType: msg.senderType, // "admin"
      content: msg.content,
      createdAt: msg.createdAt,
    });

    return NextResponse.json({
      _id: msg._id.toString(),
      role: msg.role,
      senderType: msg.senderType,
      content: msg.content,
      createdAt: msg.createdAt,
    });
  } catch (err: any) {
    console.error("Admin reply error:", err);
    return NextResponse.json(
      { error: "Failed to send reply", details: err.message },
      { status: 500 }
    );
  }
}
