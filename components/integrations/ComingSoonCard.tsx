import { useTranslations } from "next-intl";
import { Store } from "lucide-react";

export type ComingSoonPlatform = "trendyol" | "amazon" | "etsy" | "ebay" | "aliexpress";

export function ComingSoonCard({ platformKey }: { platformKey: ComingSoonPlatform }) {
  const t = useTranslations("integrations");

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 opacity-60">
      <div className="flex items-center gap-3 mb-2">
        <span className="w-9 h-9 rounded-xl bg-[var(--surface-2)] flex items-center justify-center shrink-0">
          <Store className="w-4.5 h-4.5 text-muted-foreground" />
        </span>
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">{t(`platforms.${platformKey}`)}</p>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--surface-3)] text-muted-foreground">
            {t("comingSoon")}
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {t("comingSoonDesc", { platform: t(`platforms.${platformKey}`) })}
      </p>
    </div>
  );
}
