"use client";

import { useTranslations } from "next-intl";
import { modelOptionsFor } from "@/lib/modelOptions";
import type { OutputType } from "@/components/studio/OutputTypePicker";
import { cn } from "@/lib/utils";

interface Props {
  outputType: OutputType | null;
  value: string | null;
  onChange: (modelId: string) => void;
}

export function ModelPicker({ outputType, value, onChange }: Props) {
  const t = useTranslations("studio.models");

  if (!outputType) return null;
  const options = modelOptionsFor(outputType);

  return (
    <div className="mt-4">
      <p className="text-xs text-muted-foreground mb-2">{t("label")}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt, i) => {
          const isSelected = value ? value === opt.id : i === 0;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                isSelected
                  ? "gradient-brand text-white border-transparent"
                  : "border-[var(--border)] text-muted-foreground hover:text-foreground hover:border-[rgba(139,92,246,0.3)]"
              )}
            >
              {t(opt.labelKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
