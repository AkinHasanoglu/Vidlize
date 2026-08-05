"use client";

import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

type FaqItem = { question: string; answer: string };

export function FAQSection() {
  const t = useTranslations("landing");
  const items = t.raw("faq.items") as FaqItem[];

  return (
    <section id="faq" className="max-w-3xl mx-auto px-6 py-24 scroll-mt-16">
      <h2 className="text-3xl font-bold text-center gradient-hero-text mb-12">
        {t("faq.title")}
      </h2>

      <Accordion className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-6">
        {items.map((item, i) => (
          <AccordionItem key={i} value={i}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
