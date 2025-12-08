// app/api/order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import { isValidObjectId } from "mongoose";
import { sendOrderEmail } from "@/lib/email";

// 🔹 chat models import
import { getChatSessionModel } from "@/lib/models/ChatSession";
import { getChatMessageModel } from "@/lib/models/ChatMessage";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      productId,
      quantity,
      fullName,
      phone,
      email,
      address,
      source,
    } = body as {
      productId: string;
      quantity?: number;
      fullName: string;
      phone: string;
      email?: string;
      address: string;
      source?: string;
    };

    if (!productId || !isValidObjectId(productId)) {
      console.warn("Invalid productId from client:", productId);
      return NextResponse.json(
        {
          error:
            "সঠিক প্রোডাক্ট সিলেক্ট করা হয়নি। আবার প্রোডাক্টের নাম লিখে চেষ্টা করুন।",
        },
        { status: 400 }
      );
    }

    const safeQuantity =
      typeof quantity === "number" && quantity > 0 ? quantity : 1;

    const order = await Order.create({
      productId,
      quantity: safeQuantity,
      fullName,
      phone,
      email,
      address,
      source: source || "facebook",
    });

    // ✅ success message (Bangla) – ek jaygay define kore dibo
    const successMessageBn =
      "আপনার অর্ডার কনফার্ম হয়েছে 🥰 ইনশাআল্লাহ খুব দ্রুত আপনাকে যোগাযোগ করা হবে। ইমেইলেও কনফার্মেশন পাঠানো হয়েছে (যদি ইমেইল দিয়ে থাকেন)।";

    // 🔹 Order save সফল হওয়ার পর email পাঠাই (best-effort)
    try {
      await sendOrderEmail({
        toCustomer: email || null,
        customerName: fullName,
        phone,
        address,
        productId: String(productId),
        quantity: safeQuantity,
        orderId: order._id.toString(),
      });
    } catch (mailErr) {
      console.warn("Order saved but email send failed:", mailErr);
    }

    // 🔹 Chat side: একই success মেসেজটাকে chat history তেও সংরক্ষণ করি
    try {
      const sessionKey = req.cookies.get("hb_session")?.value || null;

      if (sessionKey) {
        const ChatSession = await getChatSessionModel();
        const ChatMessage = await getChatMessageModel();

        const session = await ChatSession.findOne({ sessionKey });
        if (session) {
          await ChatMessage.create({
            sessionId: session._id,
            role: "assistant",
            senderType: "ai",
            content: successMessageBn,
          });

          session.lastMessageAt = new Date();
          await session.save();
        }
      }
    } catch (chatErr) {
      console.warn(
        "Order saved but chat success message failed:",
        chatErr
      );
      // chat message fail holeo order+email already done, tai here just warn
    }

    return NextResponse.json(
      {
        orderId: order._id.toString(),
        messageBn: successMessageBn,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Order API error:", err);
    return NextResponse.json(
      { error: "অর্ডার করতে সমস্যা হয়েছে, একটু পরে আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
