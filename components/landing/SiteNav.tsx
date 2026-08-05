import { useTranslations } from "next-intl";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shell/LanguageSwitcher";
import { MobileNav } from "@/components/landing/MobileNav";

export function SiteNav({ locale }: { locale: string }) {
  const t = useTranslations("landing");
  const tCommon = useTranslations("common");

  return (
    <nav className="relative flex items-center justify-between max-w-6xl mx-auto px-6 h-16">
      <Link href={`/${locale}`} className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center shadow-[0_4px_12px_rgba(139,92,246,0.4)]">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-sm gradient-hero-text tracking-tight">
          {tCommon("appName")}
        </span>
      </Link>

      <div className="hidden sm:flex items-center gap-8 text-sm text-muted-foreground">
        <a href={`/${locale}#use-cases`} className="hover:text-foreground transition-colors">
          {t("footer.useCasesTitle")}
        </a>
        <a href={`/${locale}#features`} className="hover:text-foreground transition-colors">
          {t("nav.features")}
        </a>
        <a href={`/${locale}#showcase`} className="hover:text-foreground transition-colors">
          {t("nav.showcase")}
        </a>
        <Link href={`/${locale}/pricing`} className="hover:text-foreground transition-colors">
          {t("nav.pricing")}
        </Link>
        <a href={`/${locale}#faq`} className="hover:text-foreground transition-colors">
          {t("nav.faq")}
        </a>
      </div>

      <div className="flex items-center gap-3">
        <MobileNav
          links={[
            { href: `/${locale}#use-cases`, label: t("footer.useCasesTitle") },
            { href: `/${locale}#features`, label: t("nav.features") },
            { href: `/${locale}#showcase`, label: t("nav.showcase") },
            { href: `/${locale}/pricing`, label: t("nav.pricing") },
            { href: `/${locale}#faq`, label: t("nav.faq") },
          ]}
        />
        <LanguageSwitcher currentLocale={locale} />
        <Link href={`/${locale}/login`}>
          <Button variant="ghost" size="sm">
            {t("nav.login")}
          </Button>
        </Link>
        <Link href={`/${locale}/signup`}>
          <Button
            size="sm"
            className="gradient-brand text-white border-none shadow-[0_4px_16px_rgba(139,92,246,0.35)] hover:opacity-90 transition-opacity"
          >
            {t("nav.signup")}
          </Button>
        </Link>
      </div>
    </nav>
  );
}
