// app/api/admin/chats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminFromRequest } from "@/lib/adminAuth";
import { getChatSessionModel } from "@/lib/models/ChatSession";
import { getChatMessageModel } from "@/lib/models/ChatMessage";

export async function GET(req: NextRequest) {
  const admin = verifyAdminFromRequest(req);
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const ChatSession = await getChatSessionModel();
    const ChatMessage = await getChatMessageModel();

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") || 20);

    // সব session latest অনুযায়ী
    const sessions = await ChatSession.find({})
      .sort({ lastMessageAt: -1 })
      .limit(limit)
      .lean();

    // প্রতি session এর জন্য lastMessage + total count এনে নিই
    const result = await Promise.all(
      sessions.map(async (s: any) => {
        const lastMsg = await ChatMessage.findOne({ sessionId: s._id })
          .sort({ createdAt: -1 })
          .lean();

        const msgCount = await ChatMessage.countDocuments({
          sessionId: s._id,
        });

        return {
          _id: s._id.toString(),
          sessionKey: s.sessionKey,
          source: s.source,
          createdAt: s.createdAt,
          lastMessageAt: s.lastMessageAt,
          lastMessage: lastMsg
            ? {
                role: lastMsg.role,
                content: lastMsg.content,
                createdAt: lastMsg.createdAt,
              }
            : null,
          messageCount: msgCount,
        };
      })
    );

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Admin chats list error:", err);
    return NextResponse.json(
      { error: "Failed to load chat sessions", details: err.message },
      { status: 500 }
    );
  }
}
