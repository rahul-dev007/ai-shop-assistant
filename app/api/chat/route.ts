import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";
import { findCandidateProducts } from "@/lib/productSearch";
import { ChatAIResponse } from "@/types/chat";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body as {
      messages: { role: "user" | "assistant"; content: string }[];
    };

    if (!messages || !messages.length) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    const userMessage = messages[messages.length - 1].content;

    // 1) DB থেকে candidate products এনে নেই
    const candidates = await findCandidateProducts(userMessage);

    const previousMessages = messages.slice(0, -1);

    let aiResponse: ChatAIResponse = await callGemini(
      userMessage,
      candidates,
      previousMessages
    );

    // 2) Canonical products list → সবসময় DB candidates থেকে
    const canonicalProducts = candidates.map((c) => ({
      productId: c.productId, // MongoDB _id string
      name_bn: c.name_bn,
      price: c.price,
      imageUrl: c.imageUrl,
    }));

    // AI products যা-ই পাঠাক, আমরা canonical দিয়ে override করতে পারি
    aiResponse.products = canonicalProducts;

    // 3) selected_products sanitize করি
    if (aiResponse.selected_products && aiResponse.selected_products.length > 0) {
      const validatedSelections =
        aiResponse.selected_products
          .map((sel) => {
            const matched = canonicalProducts.find(
              (p) => p.productId === sel.productId
            );

            if (!matched) {
              // AI যদি TRP001 টাইপ কিছু দেয়, ওটা drop হবে
              return null;
            }

            return {
              productId: matched.productId,
              quantity: sel.quantity && sel.quantity > 0 ? sel.quantity : 1,
            };
          })
          .filter(Boolean) as { productId: string; quantity: number }[];

      if (validatedSelections.length === 0) {
        // কোনো valid selection না থাকলে order form দেখানোর দরকার নেই
        aiResponse.selected_products = [];
        if (aiResponse.intent === "ASK_ORDER_FORM") {
          aiResponse.intent = "SHOW_PRODUCTS"; // fallback
        }
      } else {
        aiResponse.selected_products = validatedSelections;
      }
    }

    return NextResponse.json(aiResponse);
  } catch (err: any) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Chat error", details: err.message },
      { status: 500 }
    );
  }
}
