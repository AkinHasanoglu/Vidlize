"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const LOCALES = ["tr", "en", "es", "zh", "ru"] as const;

interface Props {
  locale: string;
}

export function LanguageSection({ locale }: Props) {
  const t = useTranslations("settings");
  const router = useRouter();

  const switchLocale = (next: string) => {
    if (next === locale) return;
    router.push(`/${next}/settings`);
    router.refresh();
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
        {t("language")}
      </h2>
      <div className="flex flex-wrap gap-2">
        {LOCALES.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => switchLocale(code)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
              locale === code
                ? "gradient-brand text-white border-transparent shadow-[0_4px_12px_rgba(139,92,246,0.3)]"
                : "border-[var(--border)] text-muted-foreground hover:text-foreground"
            )}
          >
            {t(`languages.${code}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
