"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { STOCK_BACKGROUNDS } from "@/lib/stockBackgrounds";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Props {
  value: string | null;
  onChange: (url: string) => void;
}

export function StockGallery({ value, onChange }: Props) {
  const t = useTranslations("studio.stockLabels");

  return (
    <div className="grid grid-cols-4 gap-2">
      {STOCK_BACKGROUNDS.map((bg) => {
        const selected = value === bg.url;
        return (
          <button
            key={bg.id}
            type="button"
            onClick={() => onChange(bg.url)}
            title={t(bg.id as Parameters<typeof t>[0])}
            className={cn(
              "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
              selected
                ? "border-[#8B5CF6] shadow-[0_0_0_3px_rgba(139,92,246,0.2),0_8px_24px_rgba(139,92,246,0.3)]"
                : "border-transparent hover:border-[rgba(139,92,246,0.4)]"
            )}
          >
            <Image
              src={bg.url}
              alt={t(bg.id as Parameters<typeof t>[0])}
              fill
              className="object-cover transition-transform hover:scale-110"
              sizes="80px"
            />
            {selected && (
              <>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(139,92,246,0.4)]" />
                <div className="absolute top-1 right-1 w-5 h-5 rounded-full gradient-brand flex items-center justify-center shadow-[0_4px_12px_rgba(139,92,246,0.4)]">
                  <Check className="h-3 w-3 text-white" />
                </div>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
