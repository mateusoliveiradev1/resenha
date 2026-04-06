import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function hasSessionCookie(request: NextRequest) {
    return Boolean(
        request.cookies.get("authjs.session-token")?.value ||
            request.cookies.get("__Secure-authjs.session-token")?.value
    );
}

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isLoginRoute = pathname.startsWith("/login");
    const hasSession = hasSessionCookie(request);

    if (!isLoginRoute && !hasSession) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
