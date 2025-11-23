import { connectDB } from "@/lib/db";
import { getProductModel } from "@/lib/models/Product";

// 🔹 Regex-special character গুলো escape করার helper
function escapeRegex(str: string) {
  // . * + ? ^ $ { } ( ) | [ ] \  — এগুলো সব escape করে দিচ্ছি
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function findCandidateProducts(userText: string) {
  await connectDB();
  const Product = await getProductModel();

  // userText থেকে শব্দ বের করি, regex-safe বানাই
  const tokens = userText
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1) // ১ অক্ষরের শব্দ ( যেমন “a”, “?” ) বাদ
    .map((w) => escapeRegex(w)); // এখানে ?, *, | সব escape হয়ে যাবে

  if (tokens.length === 0) {
    // কিছুই meaningful না পেলে empty result
    return [];
  }

  const regex = new RegExp(tokens.join("|"), "i");

  const products = await Product.find({
    $or: [
      { name_bn: regex },
      { category: regex },
      { tags: regex }, // যদি tags array হয় তাও কাজ করবে
    ],
  })
    .limit(10)
    .lean();

  return products.map((p: any) => ({
    productId: String(p._id),
    name_bn: p.name_bn,
    price: p.price,
    imageUrl: p.imageUrl ?? null,
    category: p.category,
    tags: p.tags,
  }));
}
