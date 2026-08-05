import { useTranslations } from "next-intl";
import Image from "next/image";
import { Play } from "lucide-react";

type Category = { name: string };

const SEEDS = ["beauty", "fashion", "tech", "supplements"];

export function VideoShowcase() {
  const t = useTranslations("landing");
  const categories = t.raw("showcase.categories") as Category[];

  return (
    <section id="showcase" className="max-w-6xl mx-auto px-6 py-24 scroll-mt-16">
      <h2 className="text-3xl font-bold text-center gradient-hero-text mb-4">
        {t("showcase.title")}
      </h2>
      <p className="text-muted-foreground text-center max-w-xl mx-auto mb-2">
        {t("showcase.subtitle")}
      </p>
      <p className="text-xs text-muted-foreground/60 text-center mb-12">{t("showcase.disclaimer")}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {categories.map((cat, i) => {
          const seed = SEEDS[i % SEEDS.length];
          return (
            <div key={i} className="group">
              <div className="relative aspect-[9/16] rounded-xl overflow-hidden border border-[var(--border)]">
                <Image
                  src={`https://picsum.photos/seed/ugc-${seed}/400/700`}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                  </div>
                </div>
              </div>
              <p className="text-xs font-medium text-muted-foreground text-center mt-2">
                {cat.name}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
