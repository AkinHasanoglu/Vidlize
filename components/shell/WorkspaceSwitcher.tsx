"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Settings2, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type WorkspaceOption = { id: string; name: string; brandColor: string };

interface Props {
  locale: string;
  workspaces: WorkspaceOption[];
  activeWorkspaceId: string | null;
}

export function WorkspaceSwitcher({ locale, workspaces, activeWorkspaceId }: Props) {
  const t = useTranslations("workspaceSwitcher");
  const router = useRouter();

  if (workspaces.length === 0) return null;

  const active = workspaces.find((w) => w.id === activeWorkspaceId) ?? null;

  const switchTo = async (workspaceId: string | null) => {
    await fetch("/api/workspaces/active", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId }),
    });
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-8 px-2.5 flex items-center gap-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors max-w-[160px]">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: active?.brandColor ?? "#8B5CF6" }}
        />
        <span className="truncate">{active ? active.name : t("personal")}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        <DropdownMenuItem onClick={() => switchTo(null)} className="gap-2">
          {!active && <Check className="h-3.5 w-3.5" />}
          <span className={cn(!active && "font-medium text-[#C4B5FD]")}>{t("personal")}</span>
        </DropdownMenuItem>
        {workspaces.map((w) => {
          const isActive = active?.id === w.id;
          return (
            <DropdownMenuItem key={w.id} onClick={() => switchTo(w.id)} className="gap-2">
              {isActive && <Check className="h-3.5 w-3.5" />}
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: w.brandColor }} />
              <span className={cn("truncate", isActive && "font-medium text-[#C4B5FD]")}>{w.name}</span>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(`/${locale}/workspaces`)} className="gap-2">
          <Settings2 className="h-3.5 w-3.5" />
          {t("manage")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
