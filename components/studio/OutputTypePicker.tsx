"use client";

import { useTranslations } from "next-intl";
import { Camera, Video, Star, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

export type OutputType = "UGC_PHOTO" | "UGC_VIDEO" | "LIFESTYLE";

interface Option {
  value: OutputType;
  labelKey: "ugcPhoto" | "ugcVideo" | "lifestyle";
  costKey: "photoLabel" | "videoLabel" | "lifestyleLabel";
  icon: React.ElementType;
  creditCost: number;
}

const OPTIONS: Option[] = [
  { value: "UGC_PHOTO", labelKey: "ugcPhoto", costKey: "photoLabel", icon: Camera, creditCost: 1 },
  { value: "UGC_VIDEO", labelKey: "ugcVideo", costKey: "videoLabel", icon: Video, creditCost: 3 },
  { value: "LIFESTYLE", labelKey: "lifestyle", costKey: "lifestyleLabel", icon: Star, creditCost: 2 },
];

interface Props {
  value: OutputType | null;
  onChange: (v: OutputType) => void;
}

export function OutputTypePicker({ value, onChange }: Props) {
  const t = useTranslations("studio");
  const tc = useTranslations("credits");

  return (
    <div className="space-y-2">
      {OPTIONS.map(({ value: v, labelKey, costKey, icon: Icon }) => {
        const selected = value === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all",
              selected
                ? "border-[#8B5CF6] bg-[rgba(139,92,246,0.08)] text-[#C4B5FD] shadow-[0_0_0_1px_rgba(139,92,246,0.2)]"
                : "border-[var(--border)] text-muted-foreground hover:border-[rgba(139,92,246,0.3)] hover:bg-[rgba(139,92,246,0.04)]"
            )}
          >
            <span
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                selected ? "gradient-brand shadow-[0_4px_12px_rgba(139,92,246,0.3)]" : "bg-[var(--surface-3)]"
              )}
            >
              <Icon className={cn("h-4 w-4", selected ? "text-white" : "text-muted-foreground")} />
            </span>
            <span className="flex-1">{t(`outputTypes.${labelKey}`)}</span>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                selected
                  ? "bg-[rgba(139,92,246,0.2)] text-[#C4B5FD]"
                  : "bg-[var(--surface-3)] text-muted-foreground"
              )}
            >
              {tc(costKey)}
            </span>
          </button>
        );
      })}

      {/* Speaking avatar / long-form video needs a third-party avatar/video provider
          (e.g. HeyGen, D-ID) — not wired up yet, shown honestly as unavailable rather
          than faked. */}
      <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-[var(--border)] text-sm font-medium text-left opacity-50 cursor-not-allowed">
        <span className="w-8 h-8 rounded-lg bg-[var(--surface-3)] flex items-center justify-center shrink-0">
          <Mic className="h-4 w-4 text-muted-foreground" />
        </span>
        <span className="flex-1 text-muted-foreground">{t("outputTypes.avatarVideo")}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-3)] text-muted-foreground">
          {t("comingSoonBadge")}
        </span>
      </div>
    </div>
  );
}
