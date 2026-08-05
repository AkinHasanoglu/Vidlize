import { createClient } from "@/lib/supabase/server";
import { createCheckoutUrl, type PaidPlan } from "@/lib/lemonsqueezy";
import { IS_DEMO } from "@/lib/demo";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

const schema = z.object({
  plan: z.enum(["STARTER", "PRO"]),
});

export async function POST(request: NextRequest) {
  if (IS_DEMO) {
    return NextResponse.json({ error: "Not available in demo mode" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

  try {
    const url = await createCheckoutUrl({
      plan: parsed.data.plan as PaidPlan,
      userId: user.id,
      email: user.email,
      redirectUrl: `${appUrl}/create?checkout=success`,
    });
    return NextResponse.json({ url });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "checkout_failed";
    if (message.startsWith("LEMONSQUEEZY_NOT_CONFIGURED")) {
      return NextResponse.json({ error: "Payments are not configured yet" }, { status: 503 });
    }
    return NextResponse.json({ error: "Checkout creation failed" }, { status: 502 });
  }
}
