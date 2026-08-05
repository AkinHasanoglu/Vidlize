import { useTranslations } from "next-intl";

export function TrustBar() {
  const t = useTranslations("landing");
  const sectors = t.raw("trust.sectors") as string[];
  const metrics = t.raw("trust.metrics") as { value: string; label: string }[];

  return (
    <section className="max-w-6xl mx-auto px-6 pb-24">
      <div className="text-center mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-1">{t("trust.title")}</h2>
        <p className="text-xs text-muted-foreground">{t("trust.poweredBy")}</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
        <span className="text-xs text-muted-foreground mr-1">{t("trust.sectorsLabel")}:</span>
        {sectors.map((sector, i) => (
          <span
            key={i}
            className="text-xs px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)] text-muted-foreground"
          >
            {sector}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto text-center">
        {metrics.map((metric, i) => (
          <div key={i}>
            <p className="text-2xl sm:text-3xl font-bold gradient-hero-text mb-1">
              {metric.value}
            </p>
            <p className="text-xs text-muted-foreground">{metric.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
