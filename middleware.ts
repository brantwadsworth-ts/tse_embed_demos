import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  if (
    !isLoggedIn &&
    !pathname.startsWith("/api/auth") &&
    !pathname.startsWith("/api/demo") &&
    !pathname.startsWith("/api/admin/patch-demo") &&
    !pathname.startsWith("/demo") &&
    pathname !== "/login"
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
