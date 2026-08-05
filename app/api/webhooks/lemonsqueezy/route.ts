import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature, variantIdToPlan, PLAN_CREDITS } from "@/lib/lemonsqueezy";
import { NextResponse, type NextRequest } from "next/server";

const ACTIVE_STATUSES = new Set(["active", "on_trial"]);

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const eventName: string | undefined = payload?.meta?.event_name;
  const userId: string | undefined = payload?.meta?.custom_data?.user_id;
  const attributes = payload?.data?.attributes ?? {};
  const variantId: string | undefined = attributes.variant_id ? String(attributes.variant_id) : undefined;
  const status: string | undefined = attributes.status;
  const subscriptionId: string | undefined = payload?.data?.id;
  const customerId: string | undefined = attributes.customer_id ? String(attributes.customer_id) : undefined;

  if (!userId) {
    // Nothing we can attribute this event to — acknowledge so Lemon Squeezy doesn't retry forever.
    return NextResponse.json({ ok: true, ignored: "no_user_id" });
  }

  const plan = variantId ? variantIdToPlan(variantId) : null;

  switch (eventName) {
    case "subscription_created":
    case "subscription_updated":
    case "subscription_resumed": {
      const isActive = status ? ACTIVE_STATUSES.has(status) : false;
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: isActive && plan ? plan : "FREE",
          subscriptionStatus: status ?? null,
          lemonSqueezyCustomerId: customerId ?? undefined,
          lemonSqueezySubscriptionId: subscriptionId ?? undefined,
        },
      }).catch(() => {});
      break;
    }
    case "subscription_cancelled":
    case "subscription_expired": {
      await prisma.user.update({
        where: { id: userId },
        data: { plan: "FREE", subscriptionStatus: status ?? eventName },
      }).catch(() => {});
      break;
    }
    case "subscription_payment_success": {
      if (plan) {
        await prisma.user.update({
          where: { id: userId },
          data: { credits: { increment: PLAN_CREDITS[plan] } },
        }).catch(() => {});
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ ok: true });
}
