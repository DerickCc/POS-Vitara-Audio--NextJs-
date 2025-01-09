import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./utils/sessionlib";

export default async function authMiddleware(req: NextRequest) {
  const sessionCookie = req.cookies.get("vitara-session")?.value;

  if (!sessionCookie) return NextResponse.redirect(new URL('/login', req.url));
  
  if (req.url.includes('/settings')) {
    const { role } = await getSession();
    if (role !== 'Admin') return NextResponse.redirect(new URL('/unauthorized', req.url));
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