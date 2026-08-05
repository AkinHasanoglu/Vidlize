"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Camera, Zap, Sliders, Coins } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Item = { title: string; description: string };

const ICONS = [Camera, Zap, Sliders, Coins];

export function FeaturesSection() {
  const t = useTranslations("landing");
  const items = t.raw("features.items") as Item[];
  const [active, setActive] = useState(0);

  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-24 scroll-mt-16">
      <h2 className="text-3xl font-bold text-center gradient-hero-text mb-12">
        {t("features.title")}
      </h2>

      <Tabs
        value={active}
        onValueChange={(v) => setActive(v as number)}
        orientation="vertical"
        className="sm:flex-row gap-4"
      >
        <TabsList variant="line" className="sm:w-64 shrink-0 h-auto bg-transparent p-0 gap-2">
          {items.map((item, i) => {
            const Icon = ICONS[i % ICONS.length];
            const isActive = active === i;
            return (
              <TabsTrigger
                key={i}
                value={i}
                className={cn(
                  "w-full justify-start gap-3 rounded-xl border px-4 py-3 h-auto text-left after:hidden",
                  isActive
                    ? "border-[rgba(139,92,246,0.5)] bg-[var(--surface)]"
                    : "border-[var(--border)] hover:border-[rgba(139,92,246,0.3)]"
                )}
              >
                <span
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    isActive ? "gradient-brand shadow-[0_4px_12px_rgba(139,92,246,0.3)]" : "bg-[var(--surface-2)]"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-muted-foreground")} />
                </span>
                <span className={cn("font-medium text-sm", isActive ? "text-foreground" : "text-muted-foreground")}>
                  {item.title}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {items.map((item, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <TabsContent key={i} value={i} className="flex-1">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-10 h-full flex flex-col justify-center min-h-[220px]">
                <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center mb-6 shadow-[0_8px_24px_rgba(139,92,246,0.35)]">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </section>
  );
}
