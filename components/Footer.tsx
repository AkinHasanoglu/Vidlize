import { useTranslations } from "next-intl";
import Link from "next/link";
import { Sparkles } from "lucide-react";

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a2.994 2.994 0 0 0-2.108-2.12C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.39.521a2.994 2.994 0 0 0-2.108 2.12A31.35 31.35 0 0 0 0 12a31.35 31.35 0 0 0 .502 5.814 2.994 2.994 0 0 0 2.108 2.12c1.885.521 9.39.521 9.39.521s7.505 0 9.39-.521a2.994 2.994 0 0 0 2.108-2.12A31.35 31.35 0 0 0 24 12a31.35 31.35 0 0 0-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3c-.19.34-.377.735-.517 1.043a18.27 18.27 0 0 0-4.083 0A9.53 9.53 0 0 0 11.44 3a19.79 19.79 0 0 0-3.76 1.369C4.34 8.32 3.53 12.146 3.75 15.92a19.9 19.9 0 0 0 5.993 3.03c.243-.334.459-.687.646-1.058a12.9 12.9 0 0 1-1.02-.49c.086-.062.17-.127.252-.193a14.09 14.09 0 0 0 12.02 0c.083.066.166.131.252.193-.324.19-.666.354-1.02.49.187.371.403.724.646 1.058a19.86 19.86 0 0 0 5.993-3.03c.264-4.355-.596-8.146-3.195-11.551ZM9.68 13.53c-.86 0-1.562-.79-1.562-1.76 0-.97.687-1.76 1.562-1.76.883 0 1.578.797 1.562 1.76 0 .97-.687 1.76-1.562 1.76Zm6.64 0c-.86 0-1.562-.79-1.562-1.76 0-.97.687-1.76 1.562-1.76.883 0 1.578.797 1.562 1.76 0 .97-.68 1.76-1.562 1.76Z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { name: "X", Icon: XIcon },
  { name: "YouTube", Icon: YoutubeIcon },
  { name: "Instagram", Icon: InstagramIcon },
  { name: "Discord", Icon: DiscordIcon },
];

function FooterColumn({ title, items, hrefs }: { title: string; items: string[]; hrefs: string[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-4">{title}</h3>
      <ul className="flex flex-col gap-2.5">
        {items.map((item, i) => {
          const href = hrefs[i] ?? "#";
          const className = "text-sm text-muted-foreground hover:text-foreground transition-colors";
          return (
            <li key={i}>
              {href.startsWith("#") ? (
                <a href={href} className={className}>
                  {item}
                </a>
              ) : (
                <Link href={href} className={className}>
                  {item}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Footer({ locale }: { locale: string }) {
  const t = useTranslations("landing");
  const tCommon = useTranslations("common");

  const useCasesItems = t.raw("footer.useCasesItems") as string[];
  const featuresItems = t.raw("footer.featuresItems") as string[];
  const companyItems = t.raw("footer.companyItems") as string[];
  const legalItems = t.raw("footer.legalItems") as string[];

  const companyHrefs = [`/${locale}/pricing`, `/${locale}#showcase`, `/${locale}#faq`];
  const legalHrefs = [
    `/${locale}/legal/terms`,
    `/${locale}/legal/privacy`,
    `/${locale}/legal/cookies`,
  ];

  return (
    <footer className="border-t border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 lg:grid-cols-6 gap-10">
        {/* Brand column */}
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center shadow-[0_4px_12px_rgba(139,92,246,0.4)]">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm gradient-hero-text tracking-tight">
              {tCommon("appName")}
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">
            {t("footer.description")}
          </p>
          <div className="flex items-center gap-2">
            {SOCIAL_LINKS.map(({ name, Icon }) => (
              <a
                key={name}
                href="#"
                aria-label={name}
                className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[var(--surface-2)] transition-colors"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        <FooterColumn
          title={t("footer.useCasesTitle")}
          items={useCasesItems}
          hrefs={useCasesItems.map(() => "#use-cases")}
        />
        <FooterColumn
          title={t("footer.featuresTitle")}
          items={featuresItems}
          hrefs={featuresItems.map(() => "#features")}
        />
        <FooterColumn title={t("footer.companyTitle")} items={companyItems} hrefs={companyHrefs} />
        <FooterColumn title={t("footer.legalTitle")} items={legalItems} hrefs={legalHrefs} />
      </div>

      <div className="border-t border-[var(--border)] py-6 text-center text-xs text-muted-foreground">
        <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
}
