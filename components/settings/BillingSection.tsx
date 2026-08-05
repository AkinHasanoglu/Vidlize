"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Plan = "FREE" | "STARTER" | "PRO";

const PLANS: { id: Plan; credits: number }[] = [
  { id: "FREE", credits: 5 },
  { id: "STARTER", credits: 50 },
  { id: "PRO", credits: 200 },
];

interface Props {
  currentPlan: Plan;
  disabled?: boolean;
}

export function BillingSection({ currentPlan, disabled }: Props) {
  const t = useTranslations("settings.billing");
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);

  const handleUpgrade = async (plan: "STARTER" | "PRO") => {
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error ?? "checkout_failed");
      window.location.assign(data.url);
    } catch {
      toast.error(t("notConfigured"));
      setLoadingPlan(null);
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
        {t("title")}
      </h2>
      <div className="grid sm:grid-cols-3 gap-3">
        {PLANS.map(({ id, credits }) => {
          const isCurrent = id === currentPlan;
          return (
            <div
              key={id}
              className={cn(
                "rounded-xl border p-4 flex flex-col gap-2",
                isCurrent ? "border-[rgba(139,92,246,0.5)] bg-[var(--surface-2)]" : "border-[var(--border)]"
              )}
            >
              <span className="text-sm font-semibold text-foreground">{t(`plans.${id}`)}</span>
              <span className="text-xs text-muted-foreground">{t("creditsLabel", { count: credits })}</span>
              {isCurrent ? (
                <span className="text-xs text-[#C4B5FD] mt-auto">{t("currentPlan")}</span>
              ) : id === "FREE" ? null : (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={disabled || loadingPlan !== null}
                  onClick={() => handleUpgrade(id as "STARTER" | "PRO")}
                  className="mt-auto"
                >
                  {loadingPlan === id ? t("redirecting") : t("upgrade")}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
