import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["tr", "en", "es", "zh", "ru"],
  defaultLocale: "tr",
  localePrefix: "always",
});
