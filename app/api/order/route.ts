import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import { isValidObjectId } from "mongoose";
import { sendOrderEmail } from "@/lib/email";

export async function POST(req: Request) {
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
    } = body;

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

    // 🔹 Order save সফল হওয়ার পর email পাঠাই
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
      // ইচ্ছা করলে এখানে কিছু না করলেও চলে, শুধু warning
    }

    return NextResponse.json(
      {
        orderId: order._id.toString(),
        messageBn:
          "আপনার অর্ডার কনফার্ম হয়েছে 🥰 ইনশাআল্লাহ খুব দ্রুত আপনাকে যোগাযোগ করা হবে। ইমেইলেও কনফার্মেশন পাঠানো হয়েছে (যদি ইমেইল দিয়ে থাকেন)।",
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
