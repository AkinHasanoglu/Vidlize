import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { listShopifyProducts } from "@/lib/shopify";
import { decryptSecret } from "@/lib/crypto";
import { IS_DEMO } from "@/lib/demo";
import { NextResponse } from "next/server";

export async function GET() {
  if (IS_DEMO) return NextResponse.json({ products: [] });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const connection = await prisma.storeConnection.findUnique({
    where: { userId_platform: { userId: user.id, platform: "SHOPIFY" } },
  });
  if (!connection) return NextResponse.json({ products: [] });

  try {
    const accessToken = decryptSecret(connection.accessToken);
    const products = await listShopifyProducts(connection.shopDomain, accessToken);
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: "Could not fetch products" }, { status: 502 });
  }
}
