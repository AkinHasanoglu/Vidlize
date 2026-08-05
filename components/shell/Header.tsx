"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CreditBadge } from "./CreditBadge";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { WorkspaceSwitcher, type WorkspaceOption } from "./WorkspaceSwitcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";

interface Props {
  locale: string;
  credits: number;
  userEmail: string;
  userAvatarUrl?: string | null;
  userFullName?: string | null;
  workspaces?: WorkspaceOption[];
  activeWorkspaceId?: string | null;
}

export function Header({
  locale,
  credits,
  userEmail,
  userAvatarUrl,
  userFullName,
  workspaces = [],
  activeWorkspaceId = null,
}: Props) {
  const t = useTranslations("common");
  const router = useRouter();
  const supabase = createClient();

  const initials = userFullName
    ? userFullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : userEmail[0].toUpperCase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
    router.refresh();
  };

  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm flex items-center justify-end px-6 gap-3 sticky top-0 z-10">
      <WorkspaceSwitcher locale={locale} workspaces={workspaces} activeWorkspaceId={activeWorkspaceId} />
      <LanguageSwitcher currentLocale={locale} />
      <CreditBadge credits={credits} />

      <DropdownMenu>
        <DropdownMenuTrigger className="outline-none rounded-full focus-visible:ring-2 focus-visible:ring-[#8B5CF6]">
          <Avatar className="h-8 w-8 cursor-pointer border border-[var(--border-strong,rgba(255,255,255,0.12))]">
            <AvatarImage src={userAvatarUrl ?? undefined} />
            <AvatarFallback className="gradient-brand text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-3 py-2 text-xs text-muted-foreground truncate">
            {userEmail}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2">
            <User className="h-4 w-4" />
            {t("settings")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="gap-2 text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
