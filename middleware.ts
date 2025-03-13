import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isConnectPage = request.nextUrl.pathname === "/connect-linkedin";

  // Handle auth pages
  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!token) {
    const redirectUrl = new URL("/auth/signin", request.url);
    redirectUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check LinkedIn connection status
  const isLinkedinConnected = !token.needsLinkedinConn as boolean;

  // Allow access to connect-linkedin page
  if (isConnectPage) {
    if (isLinkedinConnected) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Redirect to connect-linkedin page if not connected
  if (!isLinkedinConnected && !isConnectPage) {
    return NextResponse.redirect(new URL("/connect-linkedin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public|blogs|terms-of-use|privacy-policy|$).*)"],
};
