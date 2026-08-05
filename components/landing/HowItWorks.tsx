import { useTranslations } from "next-intl";

type Step = { title: string; description: string };

export function HowItWorks() {
  const t = useTranslations("landing");
  const steps = t.raw("howItWorks.steps") as Step[];

  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <h2 className="text-3xl font-bold text-center gradient-hero-text mb-4">
        {t("howItWorks.title")}
      </h2>
      <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
        {t("howItWorks.subtitle")}
      </p>

      <div className="grid sm:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <div key={i} className="relative">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center mb-4 shadow-[0_4px_12px_rgba(139,92,246,0.3)] font-bold text-white">
              {i + 1}
            </div>
            <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
