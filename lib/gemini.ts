import { ChatAIResponse } from "@/types/chat";
import { SYSTEM_PROMPT } from "@/lib/prompt";

const apiKey = "AIzaSyBi4v2-0ZjCMsGqUzFYaDnOgYqUMZ1l_2Y";

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set in .env.local");
}

export async function callGemini(
  userMessage: string,
  candidates: any[],
  previousMessages: { role: "user" | "assistant"; content: string }[]
): Promise<ChatAIResponse> {
  if (!apiKey) {
    return {
      reply_bn: "AI key ঠিক নেই। পরে চেষ্টা করুন।",
      intent: "CHAT",
    };
  }

  // 👉 Your project’s ONLY supported model:
  const url =
    "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" +
    apiKey;


  const historyText = previousMessages
    .map((m) => `${m.role === "user" ? "USER" : "AI"}: ${m.content}`)
    .join("\n");

  const prompt = `
${SYSTEM_PROMPT}

আগের কথোপকথন:
${historyText}

Candidate products (JSON):
${JSON.stringify(candidates, null, 2)}

User message:
${userMessage}

➡ JSON ফরম্যাটে উত্তর দাও। শুধুমাত্র JSON দেবে।
`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini HTTP error:", res.status, errText);
      return {
        reply_bn:
          "দুঃখিত, AI সার্ভার থেকে রেসপন্স পাওয়া যায়নি। পরে আবার চেষ্টা করুন।",
        intent: "CHAT",
      };
    }

    const data = await res.json();

    const parts = data.candidates?.[0]?.content?.parts || [];
    const text = parts.map((p: any) => p.text || "").join("\n").trim();

    const cleaned = text
      .replace(/^```json/gi, "")
      .replace(/^```/gi, "")
      .replace(/```$/gi, "")
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch (e) {
      console.error("JSON parse failed:", cleaned);
      return {
        reply_bn:
          "দুঃখিত, আমি ঠিক মতো বুঝতে পারিনি। আরেকবার একটু পরিষ্কার করে লিখবেন?",
        intent: "CHAT",
      };
    }
  } catch (e: any) {
    console.error("Fetch error:", e);
    return {
      reply_bn:
        "দুঃখিত, AI কল করার সময় সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।",
      intent: "CHAT",
    };
  }
}
