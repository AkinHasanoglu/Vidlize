import Image from "next/image";
import { cn } from "@/lib/utils";

const NICHE_WATERMARKS = [
  { seed: "ugc-beauty", className: "top-[-12%] left-[-8%] w-[520px] h-[520px] -rotate-6" },
  { seed: "ugc-fashion", className: "top-[2%] right-[-12%] w-[480px] h-[480px] rotate-3" },
  { seed: "ugc-tech", className: "bottom-[-18%] left-[12%] w-[460px] h-[460px] rotate-2" },
  { seed: "ugc-supplements", className: "bottom-[-8%] right-[2%] w-[440px] h-[440px] -rotate-3" },
];

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Niche product photography, dimmed into a background watermark — keeps the brand palette in front */}
      {NICHE_WATERMARKS.map(({ seed, className }) => (
        <div
          key={seed}
          className={cn(
            "absolute rounded-[3rem] overflow-hidden opacity-[0.1] grayscale blur-[2px]",
            className
          )}
        >
          <Image
            src={`https://picsum.photos/seed/${seed}/700/700`}
            alt=""
            fill
            className="object-cover"
            sizes="600px"
          />
        </div>
      ))}

      {/* Scrim so the imagery reads as texture, not photography, and text stays readable */}
      <div className="absolute inset-0 bg-background/70" />

      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#8B5CF6]/20 blur-[120px] animate-blob-1" />
      <div className="absolute top-0 -right-40 w-[450px] h-[450px] rounded-full bg-[#3B82F6]/20 blur-[120px] animate-blob-2" />
      <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-[#8B5CF6]/10 blur-[100px] animate-blob-3" />
    </div>
  );
}
