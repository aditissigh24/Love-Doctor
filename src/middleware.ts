import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const hostname = request.headers.get("host") || "";
    const url = request.nextUrl;

    // Skip internal paths and files
    if (
        url.pathname.startsWith("/_next") ||
        url.pathname.startsWith("/api") ||
        url.pathname.startsWith("/static") ||
        url.pathname.includes(".") // files with extensions (e.g. images, css)
    ) {
        return NextResponse.next();
    }

    const searchParams = request.nextUrl.searchParams.toString();
    const path = `${url.pathname}${
        searchParams.length > 0 ? `?${searchParams}` : ""
    }`;

    // Check for coaches subdomain
    // Matches coaches.localhost:3000 or coaches.love-doctor.com
    if (hostname.startsWith("coaches.")) {
        return NextResponse.rewrite(new URL(`/coach-site${path}`, request.url));
    }

    // Default to main app
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
