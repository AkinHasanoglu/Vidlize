import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IS_DEMO } from "@/lib/demo";
import { getTranslations } from "next-intl/server";
import { Code2 } from "lucide-react";
import { ApiKeysSection, type ApiKeySummary } from "@/components/developer/ApiKeysSection";
import { WebhookSection, type WebhookConfig } from "@/components/developer/WebhookSection";

type Props = { params: Promise<{ locale: string }> };

export default async function DeveloperPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("developer");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const [keys, webhook] = IS_DEMO
    ? [[] as ApiKeySummary[], null as WebhookConfig]
    : await Promise.all([getApiKeys(user.id), getWebhook(user.id)]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://yourapp.com";

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-2 mb-2">
        <Code2 className="h-5 w-5 text-[#8B5CF6]" />
        <h1 className="text-2xl font-bold gradient-hero-text">{t("title")}</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-8">{t("subtitle")}</p>

      <div className="space-y-6">
        <ApiKeysSection keys={keys} disabled={IS_DEMO} />
        <WebhookSection endpoint={webhook} disabled={IS_DEMO} />

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            {t("quickstart.title")}
          </h2>
          <pre className="text-xs bg-black/30 rounded-xl p-4 overflow-x-auto whitespace-pre">
{`curl -X POST ${appUrl}/api/v1/jobs \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "outputType": "UGC_PHOTO",
    "backgroundType": "NONE",
    "sourceImageUrl": "https://example.com/product.jpg"
  }'`}
          </pre>
        </div>
      </div>
    </div>
  );
}

async function getApiKeys(userId: string): Promise<ApiKeySummary[]> {
  try {
    const { prisma } = await import("@/lib/prisma");
    return await prisma.apiKey.findMany({
      where: { userId },
      select: { id: true, name: true, keyPrefix: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

async function getWebhook(userId: string): Promise<WebhookConfig> {
  try {
    const { prisma } = await import("@/lib/prisma");
    return await prisma.webhookEndpoint.findUnique({
      where: { userId },
      select: { url: true, secret: true },
    });
  } catch {
    return null;
  }
}
