// app/api/admin/chats/[id]/toggle-ai/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminFromRequest } from "@/lib/adminAuth";
import { getChatSessionModel } from "@/lib/models/ChatSession";
import { Types } from "mongoose";

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
      return NextResponse.json(
        { error: "Invalid session id" },
        { status: 400 }
      );
    }

    const ChatSession = await getChatSessionModel();
    const session = await ChatSession.findById(id);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // 🔁 flip aiDisabled
    session.aiDisabled = !session.aiDisabled;
    await session.save();

    return NextResponse.json({
      aiDisabled: session.aiDisabled,
    });
  } catch (err: any) {
    console.error("Toggle AI error:", err);
    return NextResponse.json(
      { error: "Failed to toggle AI", details: err.message },
      { status: 500 }
    );
  }
}
