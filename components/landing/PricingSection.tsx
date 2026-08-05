"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PricingPlan = {
  name: string;
  price: string;
  priceAnnual: string;
  period: string;
  periodAnnual: string;
  credits: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  savingsBadge?: string;
};

export function PricingSection({ locale }: { locale: string }) {
  const t = useTranslations("landing");
  const [annual, setAnnual] = useState(false);

  const plans = t.raw("pricing.plans") as PricingPlan[];

  return (
    <section id="pricing" className="max-w-6xl mx-auto px-6 py-24 scroll-mt-16">
      <h2 className="text-3xl font-bold text-center gradient-hero-text mb-4">
        {t("pricing.title")}
      </h2>
      <p className="text-muted-foreground text-center max-w-xl mx-auto mb-8">
        {t("pricing.subtitle")}
      </p>

      <div className="flex items-center justify-center gap-1 p-1 rounded-full bg-[var(--surface-2)] border border-[var(--border)] w-fit mx-auto mb-12">
        <button
          type="button"
          onClick={() => setAnnual(false)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
            !annual ? "gradient-brand text-white shadow-[0_4px_12px_rgba(139,92,246,0.3)]" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t("pricing.billingToggle.monthly")}
        </button>
        <button
          type="button"
          onClick={() => setAnnual(true)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
            annual ? "gradient-brand text-white shadow-[0_4px_12px_rgba(139,92,246,0.3)]" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t("pricing.billingToggle.annual")}
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full",
              annual ? "bg-white/20" : "bg-[rgba(139,92,246,0.15)] text-[#C4B5FD]"
            )}
          >
            {t("pricing.billingToggle.save")}
          </span>
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan, i) => (
          <div
            key={i}
            className={cn(
              "relative flex flex-col rounded-2xl p-6 border transition-colors",
              plan.highlighted
                ? "bg-[var(--surface)] border-[rgba(139,92,246,0.5)] shadow-[0_0_60px_rgba(139,92,246,0.15)]"
                : "bg-[var(--surface)] border-[var(--border)] hover:border-[rgba(139,92,246,0.3)]"
            )}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold text-white gradient-brand shadow-[0_4px_12px_rgba(139,92,246,0.4)]">
                {t("pricing.badge.popular")}
              </span>
            )}

            <h3 className="font-semibold text-foreground mb-1">{plan.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-bold gradient-hero-text">
                {annual ? plan.priceAnnual : plan.price}
              </span>
              {(annual ? plan.periodAnnual : plan.period) && (
                <span className="text-sm text-muted-foreground">
                  {annual ? plan.periodAnnual : plan.period}
                </span>
              )}
              {annual && plan.savingsBadge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(139,92,246,0.15)] text-[#C4B5FD] ml-1">
                  {plan.savingsBadge}
                </span>
              )}
            </div>
            {annual && plan.savingsBadge && (
              <p className="text-[11px] text-muted-foreground/70 mb-1">{t("pricing.annualBilledNote")}</p>
            )}
            <p className="text-xs text-muted-foreground mb-6">{plan.credits}</p>

            <ul className="flex flex-col gap-2.5 mb-8 flex-1">
              {plan.features.map((feature, fi) => (
                <li key={fi} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link href={`/${locale}/signup`} className="mt-auto">
              <Button
                className={cn(
                  "w-full",
                  plan.highlighted
                    ? "gradient-brand text-white border-none shadow-[0_4px_16px_rgba(139,92,246,0.35)] hover:opacity-90 transition-opacity"
                    : ""
                )}
                variant={plan.highlighted ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-8">{t("pricing.footnote")}</p>
    </section>
  );
}
