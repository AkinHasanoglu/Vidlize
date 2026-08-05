"use client";

import { useTranslations } from "next-intl";
import { Sparkle } from "lucide-react";
import { CAMPAIGN_PRESETS, type CampaignPresetId } from "@/lib/campaignPresets";
import { STOCK_BACKGROUNDS } from "@/lib/stockBackgrounds";
import { cn } from "@/lib/utils";

export interface SelectedCampaign {
  id: CampaignPresetId;
  prompt: string;
  backgroundUrl: string;
}

interface Props {
  selectedId?: CampaignPresetId | null;
  onSelect: (preset: SelectedCampaign) => void;
}

export function CampaignPresets({ selectedId, onSelect }: Props) {
  const t = useTranslations("studio.campaigns");

  return (
    <div className="mb-3">
      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
        <Sparkle className="h-3 w-3" />
        {t("label")}
      </p>
      <div className="flex flex-wrap gap-2">
        {CAMPAIGN_PRESETS.map((preset) => {
          const bg = STOCK_BACKGROUNDS.find((b) => b.id === preset.backgroundId);
          const isSelected = selectedId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() =>
                onSelect({
                  id: preset.id,
                  prompt: t(`items.${preset.id}.prompt`),
                  backgroundUrl: bg?.url ?? "",
                })
              }
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                isSelected
                  ? "gradient-brand text-white border-transparent"
                  : "border-[var(--border)] text-muted-foreground hover:text-foreground hover:border-[rgba(139,92,246,0.3)]"
              )}
            >
              {t(`items.${preset.id}.name`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
