export type ComplianceCategory = "healthClaim" | "guaranteeClaim" | "miracleClaim";
export type ComplianceMatch = { phrase: string; category: ComplianceCategory };

/**
 * Lightweight, offline keyword screen for phrases that commonly trigger Meta/TikTok
 * ad-policy rejections in the Beauty & Supplements niches (unsubstantiated health
 * claims, guaranteed results, "miracle" language). Advisory only — not legal advice
 * and not a substitute for each platform's actual policy review.
 */
const PATTERN_GROUPS: { category: ComplianceCategory; terms: string[] }[] = [
  {
    category: "healthClaim",
    terms: [
      "tedavi eder", "iyileştirir", "hastalığı geçirir", "kanseri önler", "diyabeti tedavi eder",
      "ağrıyı keser", "cures", "treats disease", "heals", "cures cancer", "cures diabetes",
      "prevents disease", "clinically proven to cure",
    ],
  },
  {
    category: "guaranteeClaim",
    terms: [
      "garantili kilo verme", "kesin sonuç", "garantili sonuç", "%100 etkili", "kesin kilo verdirir",
      "guaranteed weight loss", "guaranteed results", "100% effective", "guaranteed to work",
      "risk-free guarantee",
    ],
  },
  {
    category: "miracleClaim",
    terms: [
      "mucize", "sihirli formül", "anında etki", "bir gecede",
      "miracle cure", "magic formula", "instant results", "overnight results",
    ],
  },
];

export function checkAdCompliance(text: string): ComplianceMatch[] {
  const lower = text.toLowerCase();
  const matches: ComplianceMatch[] = [];
  for (const { category, terms } of PATTERN_GROUPS) {
    for (const term of terms) {
      if (lower.includes(term.toLowerCase())) {
        matches.push({ phrase: term, category });
      }
    }
  }
  return matches;
}
