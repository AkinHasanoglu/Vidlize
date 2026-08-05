import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IS_DEMO, DEMO_USER } from "@/lib/demo";
import { getTranslations } from "next-intl/server";
import { Settings } from "lucide-react";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { LanguageSection } from "@/components/settings/LanguageSection";
import { BillingSection } from "@/components/settings/BillingSection";
import { DangerZone } from "@/components/settings/DangerZone";

type Props = { params: Promise<{ locale: string }> };

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("settings");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const dbUser = IS_DEMO ? null : await getDatabaseUser(user.id);
  const displayName = IS_DEMO ? DEMO_USER.fullName : dbUser?.fullName ?? null;
  const email = IS_DEMO ? DEMO_USER.email : user.email!;
  const plan = IS_DEMO ? "FREE" : dbUser?.plan ?? "FREE";

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-2 mb-8">
        <Settings className="h-5 w-5 text-[#8B5CF6]" />
        <h1 className="text-2xl font-bold gradient-hero-text">{t("title")}</h1>
      </div>

      {IS_DEMO && (
        <div className="mb-6 px-4 py-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-sm">
          {t("demoBanner")}
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            {t("profile")}
          </h2>
          <ProfileForm email={email} initialFullName={displayName ?? ""} disabled={IS_DEMO} />
        </div>

        <BillingSection currentPlan={plan} disabled={IS_DEMO} />

        <LanguageSection locale={locale} />

        <DangerZone locale={locale} disabled={IS_DEMO} />
      </div>
    </div>
  );
}

async function getDatabaseUser(userId: string) {
  try {
    const { prisma } = await import("@/lib/prisma");
    return await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, plan: true },
    });
  } catch {
    return null;
  }
}
