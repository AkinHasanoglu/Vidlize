import { useTranslations } from "next-intl";
import { ShoppingBag, Building2, Clapperboard } from "lucide-react";

type UseCase = { title: string; description: string };

const ICONS = [ShoppingBag, Building2, Clapperboard];

export function UseCases() {
  const t = useTranslations("landing");
  const items = t.raw("useCases.items") as UseCase[];

  return (
    <section id="use-cases" className="max-w-6xl mx-auto px-6 py-24 scroll-mt-16">
      <h2 className="text-3xl font-bold text-center gradient-hero-text mb-4">
        {t("useCases.title")}
      </h2>
      <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
        {t("useCases.subtitle")}
      </p>

      <div className="grid sm:grid-cols-3 gap-6">
        {items.map((item, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <div
              key={i}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 hover:border-[rgba(139,92,246,0.3)] transition-colors"
            >
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center mb-4 shadow-[0_4px_12px_rgba(139,92,246,0.3)]">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
