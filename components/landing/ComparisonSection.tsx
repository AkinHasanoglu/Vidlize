import { useTranslations } from "next-intl";
import { X, Check } from "lucide-react";

type Row = { label: string; value: string };

export function ComparisonSection() {
  const t = useTranslations("landing");
  const tCommon = useTranslations("common");

  const traditionalItems = t.raw("comparison.traditional.items") as Row[];
  const oursItems = t.raw("comparison.ours.items") as Row[];
  const oursTitle = t("comparison.ours.title", { appName: tCommon("appName") });

  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <h2 className="text-3xl font-bold text-center gradient-hero-text mb-4">
        {t("comparison.title")}
      </h2>
      <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
        {t("comparison.subtitle")}
      </p>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 opacity-80">
          <h3 className="font-semibold text-muted-foreground mb-5">{t("comparison.traditional.title")}</h3>
          <ul className="flex flex-col gap-4">
            {traditionalItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground/70">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.value}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-[rgba(139,92,246,0.4)] bg-[var(--surface)] p-6 shadow-[0_0_60px_rgba(139,92,246,0.15)]">
          <h3 className="font-semibold gradient-hero-text mb-5">{oursTitle}</h3>
          <ul className="flex flex-col gap-4">
            {oursItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-[#C4B5FD]/70">{item.label}</p>
                  <p className="text-sm text-foreground">{item.value}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
