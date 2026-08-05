import crypto from "node:crypto";

export type PaidPlan = "STARTER" | "PRO";

export const PLAN_CREDITS: Record<PaidPlan, number> = {
  STARTER: 50,
  PRO: 200,
};

function getVariantId(plan: PaidPlan): string {
  const key = plan === "STARTER" ? "LEMONSQUEEZY_STARTER_VARIANT_ID" : "LEMONSQUEEZY_PRO_VARIANT_ID";
  const value = process.env[key];
  if (!value) throw new Error(`LEMONSQUEEZY_NOT_CONFIGURED:${key}`);
  return value;
}

export function variantIdToPlan(variantId: string): PaidPlan | null {
  if (variantId === process.env.LEMONSQUEEZY_STARTER_VARIANT_ID) return "STARTER";
  if (variantId === process.env.LEMONSQUEEZY_PRO_VARIANT_ID) return "PRO";
  return null;
}

interface CreateCheckoutParams {
  plan: PaidPlan;
  userId: string;
  email: string;
  redirectUrl: string;
}

/**
 * Creates a Lemon Squeezy hosted checkout session and returns its URL.
 * Requires LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_STORE_ID and the plan's
 * LEMONSQUEEZY_{STARTER,PRO}_VARIANT_ID to be set — throws otherwise.
 */
export async function createCheckoutUrl({ plan, userId, email, redirectUrl }: CreateCheckoutParams): Promise<string> {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!apiKey) throw new Error("LEMONSQUEEZY_NOT_CONFIGURED:LEMONSQUEEZY_API_KEY");
  if (!storeId) throw new Error("LEMONSQUEEZY_NOT_CONFIGURED:LEMONSQUEEZY_STORE_ID");
  const variantId = getVariantId(plan);

  const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email,
            custom: { user_id: userId },
          },
          product_options: {
            redirect_url: redirectUrl,
          },
        },
        relationships: {
          store: { data: { type: "stores", id: storeId } },
          variant: { data: { type: "variants", id: variantId } },
        },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`LEMONSQUEEZY_CHECKOUT_FAILED:${res.status}:${body}`);
  }

  const json = await res.json();
  const url = json?.data?.attributes?.url;
  if (!url) throw new Error("LEMONSQUEEZY_CHECKOUT_FAILED:no_url_in_response");
  return url as string;
}

/** Verifies the `X-Signature` header Lemon Squeezy sends with every webhook request. */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(signatureHeader, "utf8");
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}
