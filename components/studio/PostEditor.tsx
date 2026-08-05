"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Crop, Type, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  imageUrl: string;
  onClose: () => void;
}

type AspectId = "original" | "square" | "portrait45" | "story" | "landscape";

const ASPECTS: { id: AspectId; ratio: number | null }[] = [
  { id: "original", ratio: null },
  { id: "square", ratio: 1 },
  { id: "portrait45", ratio: 4 / 5 },
  { id: "story", ratio: 9 / 16 },
  { id: "landscape", ratio: 16 / 9 },
];

const OUTPUT_WIDTH = 1000;

export function PostEditor({ imageUrl, onClose }: Props) {
  const t = useTranslations("studio.postEditor");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [aspect, setAspect] = useState<AspectId>("original");
  const [caption, setCaption] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setReady(true);
    };
    img.onerror = () => setError(true);
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const targetRatio = ASPECTS.find((a) => a.id === aspect)?.ratio ?? img.width / img.height;
    let cropW = img.width;
    let cropH = img.height;
    if (img.width / img.height > targetRatio) {
      cropW = img.height * targetRatio;
    } else {
      cropH = img.width / targetRatio;
    }
    const cropX = (img.width - cropW) / 2;
    const cropY = (img.height - cropH) / 2;

    const outW = OUTPUT_WIDTH;
    const outH = Math.round(outW / targetRatio);
    canvas.width = outW;
    canvas.height = outH;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, outW, outH);
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outW, outH);

    if (caption.trim()) {
      const barHeight = Math.round(outH * 0.14);
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, outH - barHeight, outW, barHeight);
      ctx.fillStyle = "#ffffff";
      ctx.font = `600 ${Math.round(outH * 0.045)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(caption.slice(0, 80), outW / 2, outH - barHeight / 2, outW - 40);
    }
  }, [ready, aspect, caption]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const url = canvas.toDataURL("image/jpeg", 0.92);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ugc-edit.jpg";
      a.click();
    } catch {
      setError(true);
    }
  };

  return (
    <div className="mt-4 w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("title")}</p>
        <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {error ? (
        <p className="text-xs text-destructive">{t("loadFailed")}</p>
      ) : (
        <>
          <canvas ref={canvasRef} className="w-full rounded-xl border border-[var(--border)] mb-3" />

          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
              <Crop className="h-3 w-3" />
              {t("aspect")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ASPECTS.map(({ id }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAspect(id)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors",
                    aspect === id
                      ? "gradient-brand text-white border-transparent"
                      : "border-[var(--border)] text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t(`aspects.${id}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
              <Type className="h-3 w-3" />
              {t("caption")}
            </p>
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={t("captionPlaceholder")}
              maxLength={80}
            />
          </div>

          <Button onClick={handleDownload} className="w-full gradient-brand text-white border-none gap-2">
            <Download className="h-4 w-4" />
            {t("download")}
          </Button>
        </>
      )}
    </div>
  );
}
