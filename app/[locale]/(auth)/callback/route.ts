import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? `/${locale}/create`;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { id, email, user_metadata } = data.user;
      // Ensure the user row exists in our DB (idempotent)
      await prisma.user.upsert({
        where: { id },
        update: {},
        create: {
          id,
          email: email!,
          fullName: user_metadata?.full_name ?? null,
          avatarUrl: user_metadata?.avatar_url ?? null,
        },
      });
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(new URL(`/${locale}/login?error=auth`, request.url));
}
