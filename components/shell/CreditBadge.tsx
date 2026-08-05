"use client";

import { useTranslations } from "next-intl";
import { Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  credits: number;
}

export function CreditBadge({ credits }: Props) {
  const t = useTranslations("credits");

  const isLow = credits > 0 && credits <= 2;
  const isEmpty = credits === 0;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 px-2.5 py-1 text-xs font-medium border",
        isEmpty
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : isLow
          ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
          : "border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.1)] text-[#C4B5FD]"
      )}
    >
      <Coins className="h-3 w-3" />
      {t("balance", { count: credits })}
    </Badge>
  );
}
