"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wand2, Clock, Building2, Plug, Code2, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  locale: string;
}

export function Sidebar({ locale }: Props) {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();

  const links = [
    { href: `/${locale}/create`, label: t("create"), icon: Wand2 },
    { href: `/${locale}/history`, label: t("history"), icon: Clock },
    { href: `/${locale}/workspaces`, label: t("workspaces"), icon: Building2 },
    { href: `/${locale}/integrations`, label: t("integrations"), icon: Plug },
    { href: `/${locale}/developer`, label: t("developer"), icon: Code2 },
    { href: `/${locale}/settings`, label: t("settings"), icon: Settings },
  ];

  return (
    <aside className="w-56 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-[var(--border)]">
        <Link href={`/${locale}/create`} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center shadow-[0_4px_12px_rgba(139,92,246,0.4)]">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm gradient-hero-text tracking-tight">
            {tCommon("appName")}
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-[rgba(139,92,246,0.15)] text-[#C4B5FD] shadow-[0_0_0_1px_rgba(139,92,246,0.2)]"
                  : "text-muted-foreground hover:bg-[var(--surface-2)] hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-[#8B5CF6]")} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
