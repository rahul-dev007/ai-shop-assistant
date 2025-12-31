// app/api/admin/chats/route.ts
import { NextResponse } from "next/server";
import { verifyAdminFromRequest } from "@/lib/adminAuth";
import { getChatSessionModel } from "@/lib/models/ChatSession";
import { getChatMessageModel } from "@/lib/models/ChatMessage";

export async function GET(req: Request) {
  const admin = verifyAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const ChatSession = await getChatSessionModel();
    await getChatMessageModel(); // ensure model registered

    const { searchParams } = new URL(req.url);
    const limitRaw = Number(searchParams.get("limit") || 20);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), 100)
      : 20;

    // ✅ aggregate pipeline
    const rows = await ChatSession.aggregate([
      { $sort: { lastMessageAt: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "chatmessages", // collection name (mongoose default: model plural)
          localField: "_id",
          foreignField: "sessionId",
          as: "msgs",
        },
      },
      {
        $addFields: {
          messageCount: { $size: "$msgs" },
          lastMessage: {
            $arrayElemAt: [
              {
                $slice: [
                  {
                    $sortArray: { input: "$msgs", sortBy: { createdAt: -1 } },
                  },
                  1,
                ],
              },
              0,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          sessionKey: 1,
          source: 1,
          createdAt: 1,
          lastMessageAt: 1,
          aiDisabled: 1,
          messageCount: 1,
          lastMessage: {
            role: "$lastMessage.role",
            content: "$lastMessage.content",
            createdAt: "$lastMessage.createdAt",
          },
        },
      },
    ]);

    return NextResponse.json(
      rows.map((s: any) => ({
        _id: s._id.toString(),
        sessionKey: s.sessionKey,
        source: s.source,
        createdAt: s.createdAt,
        lastMessageAt: s.lastMessageAt,
        aiDisabled: !!s.aiDisabled,
        lastMessage: s.lastMessage?.role
          ? {
              role: s.lastMessage.role,
              content: s.lastMessage.content,
              createdAt: s.lastMessage.createdAt,
            }
          : null,
        messageCount: s.messageCount || 0,
      }))
    );
  } catch (err: any) {
    console.error("Admin chats list error:", err);
    return NextResponse.json(
      { error: "Failed to load chat sessions", details: err.message },
      { status: 500 }
    );
  }
}
