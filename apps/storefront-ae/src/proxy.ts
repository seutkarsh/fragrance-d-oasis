import { NextRequest, NextResponse } from "next/server"
import { LOCALES, DEFAULT_LOCALE, isValidLocale } from "@/config/i18n"

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl

    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.includes(".")
    ) {
        return NextResponse.next()
    }

    const pathnameLocale = LOCALES.find(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    if (pathnameLocale && isValidLocale(pathnameLocale)) {
        return NextResponse.next()
    }

    const url = req.nextUrl.clone()
    url.pathname = `/${DEFAULT_LOCALE}${pathname}`
    return NextResponse.redirect(url)
}

export const config = {
    matcher: ["/((?!_next|api|favicon.ico).*)"],
}