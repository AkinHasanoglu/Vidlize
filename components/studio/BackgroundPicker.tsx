"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { StockGallery } from "./StockGallery";
import { Dropzone } from "./Dropzone";
import { AnimatePresence, motion } from "framer-motion";

export type BgType = "NONE" | "STOCK" | "CUSTOM";

export interface BackgroundValue {
  type: BgType;
  stockUrl?: string;
  custom?: { url: string } | { file: File; preview: string } | null;
}

interface Props {
  value: BackgroundValue;
  onChange: (v: BackgroundValue) => void;
}

const OPTIONS: { value: BgType; label: string; desc?: string }[] = [
  { value: "NONE", label: "backgrounds.none", desc: "backgrounds.noneDesc" },
  { value: "STOCK", label: "backgrounds.stock" },
  { value: "CUSTOM", label: "backgrounds.custom" },
];

export function BackgroundPicker({ value, onChange }: Props) {
  const t = useTranslations("studio");

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {OPTIONS.map(({ value: v, label, desc }) => {
          const selected = value.type === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange({ ...value, type: v })}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all",
                selected
                  ? "border-[#8B5CF6] bg-[rgba(139,92,246,0.08)] text-[#C4B5FD] shadow-[0_0_0_1px_rgba(139,92,246,0.2)]"
                  : "border-[var(--border)] text-muted-foreground hover:border-[rgba(139,92,246,0.3)] hover:bg-[rgba(139,92,246,0.04)]"
              )}
            >
              <span
                className={cn(
                  "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                  selected ? "border-[#8B5CF6]" : "border-[rgba(255,255,255,0.3)]"
                )}
              >
                {selected && (
                  <span className="w-2 h-2 rounded-full gradient-brand block" />
                )}
              </span>
              <span className="flex-1 font-medium">
                {t(label as "backgrounds.none")}
                {desc && (
                  <span className="ml-2 text-xs text-muted-foreground font-normal">
                    ({t(desc as "backgrounds.noneDesc")})
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {value.type === "STOCK" && (
          <motion.div
            key="stock"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2">
              <StockGallery
                value={value.stockUrl ?? null}
                onChange={(url) => onChange({ ...value, stockUrl: url })}
              />
            </div>
          </motion.div>
        )}

        {value.type === "CUSTOM" && (
          <motion.div
            key="custom"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2">
              <Dropzone
                value={value.custom ?? null}
                onChange={(v) => onChange({ ...value, custom: v })}
                urlPlaceholder={t("bgUrlPlaceholder")}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
