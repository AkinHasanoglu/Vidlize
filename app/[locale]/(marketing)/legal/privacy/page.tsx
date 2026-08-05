import { LegalPageContent } from "@/components/legal/LegalPageContent";

type Props = { params: Promise<{ locale: string }> };

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  return <LegalPageContent locale={locale} translationKey="privacy" />;
}
