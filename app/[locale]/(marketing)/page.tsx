import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";
import { SiteNav } from "@/components/landing/SiteNav";
import { Hero } from "@/components/landing/Hero";
import { TrustBar } from "@/components/landing/TrustBar";
import { UseCases } from "@/components/landing/UseCases";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { VideoShowcase } from "@/components/landing/VideoShowcase";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { Footer } from "@/components/Footer";

type Props = { params: Promise<{ locale: string }> };

function LandingContent({ locale }: { locale: string }) {
  const t = useTranslations("landing");

  return (
    <div className="min-h-screen bg-background bg-radial-brand relative">
      <AnimatedBackground />
      <SiteNav locale={locale} />

      <Hero locale={locale} />
      <TrustBar />
      <UseCases />
      <ComparisonSection />
      <HowItWorks />
      <VideoShowcase />
      <FeaturesSection />
      <PricingSection locale={locale} />
      <FAQSection />

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="bg-[var(--surface)] border border-[rgba(139,92,246,0.2)] rounded-3xl p-12 shadow-[0_0_80px_rgba(139,92,246,0.1)]">
          <h2 className="text-3xl font-bold gradient-hero-text mb-4">{t("ctaBottom.title")}</h2>
          <p className="text-muted-foreground mb-8">{t("ctaBottom.subtitle")}</p>
          <Link href={`/${locale}/signup`}>
            <Button
              size="lg"
              className="gradient-brand text-white border-none shadow-[0_8px_32px_rgba(139,92,246,0.4)] hover:opacity-90 transition-opacity px-10 h-12 text-base font-semibold"
            >
              {t("ctaBottom.cta")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer locale={locale} />
    </div>
  );
}

export default async function MarketingPage({ params }: Props) {
  const { locale } = await params;
  return <LandingContent locale={locale} />;
}
