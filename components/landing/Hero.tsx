"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowRight, Check, Upload, Layers, Image as ImageIcon, Type as TypeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Audience = "brand" | "agency";

export function Hero({ locale }: { locale: string }) {
  const t = useTranslations("landing");
  const tStudio = useTranslations("studio");
  const [audience, setAudience] = useState<Audience>("brand");

  const steps = [
    { Icon: Upload, label: tStudio("step1") },
    { Icon: Layers, label: tStudio("step2") },
    { Icon: ImageIcon, label: tStudio("step3") },
    { Icon: TypeIcon, label: tStudio("step4") },
  ];

  const bullets = t.raw(`hero.bullets.${audience}`) as string[];

  return (
    <section className="max-w-6xl mx-auto px-6 pt-20 pb-32 text-center">
      <h1 className="text-5xl sm:text-6xl font-bold tracking-tight gradient-hero-text leading-tight mb-6 whitespace-pre-line">
        {t("hero.title")}
      </h1>

      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
        {t("hero.subtitle")}
      </p>

      {/* Audience toggle */}
      <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[var(--surface-2)] border border-[var(--border)] mb-6">
        {(["brand", "agency"] as Audience[]).map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAudience(a)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
              audience === a
                ? "gradient-brand text-white shadow-[0_4px_12px_rgba(139,92,246,0.3)]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t(`hero.audienceToggle.${a}`)}
          </button>
        ))}
      </div>

      <ul className="flex flex-col items-center gap-2 mb-10">
        {bullets.map((bullet, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-[#8B5CF6] shrink-0" />
            {bullet}
          </li>
        ))}
      </ul>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href={`/${locale}/signup`}>
          <Button
            size="lg"
            className="gradient-brand text-white border-none shadow-[0_8px_32px_rgba(139,92,246,0.4)] hover:opacity-90 transition-opacity px-8 h-12 text-base font-semibold"
          >
            {t("hero.cta")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <p className="text-sm text-muted-foreground">{t("hero.ctaSubtitle")}</p>
      </div>

      {/* Illustrative preview of the real Studio 4-step flow (matches step1-4 in the studio namespace) */}
      <div className="relative max-w-lg mx-auto mt-20 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden text-left">
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/60" />
        </div>
        <div className="flex flex-col gap-3 p-6">
          {steps.map(({ Icon, label }, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] px-4 py-3"
            >
              <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(139,92,246,0.3)]">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="ml-auto text-xs text-muted-foreground/50">{i + 1}/4</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
