import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Section = { heading: string; body: string };

interface Props {
  locale: string;
  translationKey: "terms" | "privacy" | "cookies";
}

export function LegalPageContent({ locale, translationKey }: Props) {
  const t = useTranslations("legal");
  const tCommon = useTranslations("common");
  const appName = tCommon("appName");

  const title = t(`${translationKey}.title`);
  const sections = (t.raw(`${translationKey}.sections`) as Section[]).map((s) => ({
    heading: s.heading,
    body: s.body.replace(/\{appName\}/g, appName),
  }));

  return (
    <div className="min-h-screen bg-background bg-radial-brand px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("backToHome")}
        </Link>

        <h1 className="text-3xl font-bold gradient-hero-text mb-2">{title}</h1>
        <p className="text-xs text-muted-foreground mb-10">{t("lastUpdated")}</p>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 flex flex-col gap-8">
          {sections.map((section, i) => (
            <div key={i}>
              <h2 className="font-semibold text-foreground mb-2">{section.heading}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
