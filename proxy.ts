import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const PROTECTED_PATHS = ["/create", "/history", "/workspaces", "/integrations", "/developer", "/settings"];
const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const LOCALE_PATTERN = new RegExp(`^/(${routing.locales.join("|")})`);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Demo mode: no auth gate — let everyone into the dashboard
  if (!IS_DEMO) {
    const pathnameWithoutLocale = pathname.replace(LOCALE_PATTERN, "") || "/";
    const isProtected = PROTECTED_PATHS.some(
      (p) =>
        pathnameWithoutLocale === p ||
        pathnameWithoutLocale.startsWith(`${p}/`)
    );

    if (isProtected) {
      const token =
        request.cookies.get("sb-access-token")?.value ||
        request.cookies.get(
          `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split(".")[0]?.split("//")[1]}-auth-token`
        )?.value;

      if (!token) {
        const locale =
          pathname.match(LOCALE_PATTERN)?.[1] ?? routing.defaultLocale;
        const loginUrl = new URL(`/${locale}/login`, request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
