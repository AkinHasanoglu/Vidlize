"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { checkAdCompliance } from "@/lib/adCompliance";

interface Props {
  text: string;
}

export function ComplianceWarning({ text }: Props) {
  const t = useTranslations("studio.compliance");
  const matches = useMemo(() => checkAdCompliance(text), [text]);

  if (matches.length === 0) return null;

  return (
    <div className="mt-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3">
      <div className="flex items-center gap-2 text-yellow-400 text-xs font-medium mb-1.5">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        {t("title")}
      </div>
      <ul className="text-xs text-yellow-200/80 space-y-0.5 list-disc list-inside">
        {matches.map((m, i) => (
          <li key={i}>
            &ldquo;{m.phrase}&rdquo; — {t(`categories.${m.category}`)}
          </li>
        ))}
      </ul>
      <p className="text-[10px] text-muted-foreground mt-1.5">{t("disclaimer")}</p>
    </div>
  );
}
