import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { verifyShopifyCredentials } from "@/lib/shopify";
import { encryptSecret } from "@/lib/crypto";
import { IS_DEMO } from "@/lib/demo";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

const schema = z.object({
  shopDomain: z.string().trim().min(1).max(200),
  accessToken: z.string().trim().min(1).max(500),
});

export async function POST(request: NextRequest) {
  if (IS_DEMO) {
    return NextResponse.json({ error: "Not available in demo mode" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }

  let verified;
  try {
    verified = await verifyShopifyCredentials(parsed.data.shopDomain, parsed.data.accessToken);
  } catch {
    return NextResponse.json({ error: "Could not verify store credentials" }, { status: 400 });
  }

  const encryptedToken = encryptSecret(parsed.data.accessToken);

  const connection = await prisma.storeConnection.upsert({
    where: { userId_platform: { userId: user.id, platform: "SHOPIFY" } },
    create: {
      userId: user.id,
      platform: "SHOPIFY",
      shopDomain: verified.shopDomain,
      accessToken: encryptedToken,
      status: "CONNECTED",
    },
    update: {
      shopDomain: verified.shopDomain,
      accessToken: encryptedToken,
      status: "CONNECTED",
    },
    select: { id: true, platform: true, shopDomain: true, status: true },
  });

  return NextResponse.json({ connection });
}

export async function DELETE() {
  if (IS_DEMO) {
    return NextResponse.json({ error: "Not available in demo mode" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.storeConnection
    .delete({ where: { userId_platform: { userId: user.id, platform: "SHOPIFY" } } })
    .catch(() => {});

  return NextResponse.json({ ok: true });
}
