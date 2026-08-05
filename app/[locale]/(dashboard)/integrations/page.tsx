import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IS_DEMO } from "@/lib/demo";
import { getTranslations } from "next-intl/server";
import { Plug } from "lucide-react";
import { ShopifyConnectCard } from "@/components/integrations/ShopifyConnectCard";
import { ComingSoonCard, type ComingSoonPlatform } from "@/components/integrations/ComingSoonCard";

type Props = { params: Promise<{ locale: string }> };

const COMING_SOON_PLATFORMS: ComingSoonPlatform[] = ["trendyol", "amazon", "etsy", "ebay", "aliexpress"];

export default async function IntegrationsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("integrations");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const shopify = IS_DEMO ? null : await getShopifyConnection(user.id);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-2 mb-2">
        <Plug className="h-5 w-5 text-[#8B5CF6]" />
        <h1 className="text-2xl font-bold gradient-hero-text">{t("title")}</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-8">{t("subtitle")}</p>

      <div className="space-y-4">
        <ShopifyConnectCard connected={!!shopify} shopDomain={shopify?.shopDomain} disabled={IS_DEMO} />
        {COMING_SOON_PLATFORMS.map((p) => (
          <ComingSoonCard key={p} platformKey={p} />
        ))}
      </div>
    </div>
  );
}

async function getShopifyConnection(userId: string) {
  try {
    const { prisma } = await import("@/lib/prisma");
    return await prisma.storeConnection.findUnique({
      where: { userId_platform: { userId, platform: "SHOPIFY" } },
      select: { shopDomain: true },
    });
  } catch {
    return null;
  }
}
