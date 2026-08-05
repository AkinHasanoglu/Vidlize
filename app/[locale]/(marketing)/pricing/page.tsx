import { AnimatedBackground } from "@/components/landing/AnimatedBackground";
import { SiteNav } from "@/components/landing/SiteNav";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { Footer } from "@/components/Footer";

type Props = { params: Promise<{ locale: string }> };

export default async function PricingPage({ params }: Props) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-background bg-radial-brand relative">
      <AnimatedBackground />
      <SiteNav locale={locale} />
      <PricingSection locale={locale} />
      <FAQSection />
      <Footer locale={locale} />
    </div>
  );
}
