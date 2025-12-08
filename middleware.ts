// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // সব /admin রুট প্রোটেক্ট করব, শুধু /admin/login ছাড়া
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = req.cookies.get("admin_token")?.value;

    // token নাই → login এ পাঠাই
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    // token আছে → যেতে দাও
    return NextResponse.next();
  }

  // বাকি সব রুট নরমালি চলবে
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
