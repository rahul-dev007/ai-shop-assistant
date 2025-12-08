// lib/adminAuth.ts
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function verifyAdminFromRequest(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const token = cookie
    .split("; ")
    .find((c) => c.startsWith("admin_token="))
    ?.split("=")[1];

  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { role: string };
    if (payload.role !== "admin") return null;
    return payload;
  } catch {
    return null;
  }
}
