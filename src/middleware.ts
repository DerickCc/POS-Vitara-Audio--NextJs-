import { NextRequest, NextResponse } from "next/server";

export default function authMiddleWare(req: NextRequest) {
  const session = req.cookies.get("vitara-session")?.value;

  if (session === undefined) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  // must login to access these routes
  matcher: [
    '/',
    '/master/:path*',
    '/inventory/:path*',
    '/transaction/:path*',
    '/settings/:path*',
  ]
}