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
      return NextResponse.json(
        { error: "Invalid session id" },
        { status: 400 }
      );
    }

    const ChatSession = await getChatSessionModel();
    const ChatMessage = await getChatMessageModel();

    const session = await ChatSession.findById(id).lean();
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const messages = await ChatMessage.find({ sessionId: session._id })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      session: {
        _id: session._id.toString(),
        sessionKey: session.sessionKey,
        source: session.source,
        aiDisabled: !!session.aiDisabled, // ⭐ AI on/off status
        createdAt: session.createdAt,
        lastMessageAt: session.lastMessageAt,
      },
      messages: messages.map((m: any) => ({
        _id: m._id.toString(),
        role: m.role, // "user" | "assistant" | "system"
        senderType:
          m.senderType || (m.role === "user" ? "user" : "ai"), // default fallback
        content: m.content,
        createdAt: m.createdAt,
      })),
    });
  } catch (err: any) {
    console.error("Admin chat detail error:", err);
    return NextResponse.json(
      { error: "Failed to load chat detail", details: err.message },
      { status: 500 }
    );
  }
}
