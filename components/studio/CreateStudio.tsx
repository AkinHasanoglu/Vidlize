"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dropzone } from "@/components/studio/Dropzone";
import { OutputTypePicker, type OutputType } from "@/components/studio/OutputTypePicker";
import { ModelPicker } from "@/components/studio/ModelPicker";
import { BackgroundPicker, type BackgroundValue } from "@/components/studio/BackgroundPicker";
import { PreviewPane, type JobStatus } from "@/components/studio/PreviewPane";
import { ComplianceWarning } from "@/components/studio/ComplianceWarning";
import { CampaignPresets, type SelectedCampaign } from "@/components/studio/CampaignPresets";
import { ShopifyProductPicker } from "@/components/studio/ShopifyProductPicker";
import { toast } from "sonner";

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const DEMO_RESULTS: Record<string, string> = {
  UGC_PHOTO: "https://picsum.photos/seed/ugcphoto/600/600",
  UGC_VIDEO: "",
  LIFESTYLE: "https://picsum.photos/seed/lifestyle99/600/600",
};

type DropzoneValue = { url: string } | { file: File; preview: string } | null;

export interface JobTemplate {
  outputType: OutputType;
  backgroundType: "NONE" | "STOCK" | "CUSTOM";
  backgroundUrl: string | null;
  customPrompt: string | null;
  model: string | null;
}

function backgroundFromTemplate(template: JobTemplate): BackgroundValue {
  if (template.backgroundType === "STOCK" && template.backgroundUrl) {
    return { type: "STOCK", stockUrl: template.backgroundUrl };
  }
  if (template.backgroundType === "CUSTOM" && template.backgroundUrl) {
    return { type: "CUSTOM", custom: { url: template.backgroundUrl } };
  }
  return { type: "NONE" };
}

interface Props {
  locale: string;
  activeWorkspaceId: string | null;
  initialTemplate?: JobTemplate | null;
}

export function CreateStudio({ activeWorkspaceId, initialTemplate }: Props) {
  const t = useTranslations("studio");

  const [productImage, setProductImage] = useState<DropzoneValue>(null);
  const [outputType, setOutputType] = useState<OutputType | null>(initialTemplate?.outputType ?? null);
  const [model, setModel] = useState<string | null>(initialTemplate?.model ?? null);
  const [background, setBackground] = useState<BackgroundValue>(
    initialTemplate ? backgroundFromTemplate(initialTemplate) : { type: "NONE" }
  );
  const [customPrompt, setCustomPrompt] = useState(initialTemplate?.customPrompt ?? "");
  const [selectedCampaign, setSelectedCampaign] = useState<SelectedCampaign["id"] | null>(null);

  const handleCampaignSelect = (preset: SelectedCampaign) => {
    setSelectedCampaign(preset.id);
    setCustomPrompt(preset.prompt);
    setBackground({ type: "STOCK", stockUrl: preset.backgroundUrl });
  };

  const [jobStatus, setJobStatus] = useState<JobStatus>(null);
  const [outputMediaUrl, setOutputMediaUrl] = useState<string | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const isValid =
    productImage !== null &&
    outputType !== null &&
    (background.type !== "STOCK" || !!background.stockUrl) &&
    (background.type !== "CUSTOM" || background.custom !== null);

  const uploadFile = async (file: File): Promise<string> => {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType: file.type, filename: file.name }),
    });
    if (!res.ok) throw new Error("Upload failed");
    const { signedUrl, publicUrl } = await res.json();

    await fetch(signedUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
    return publicUrl;
  };

  const pollJobStatus = (id: string) => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/jobs/${id}`);
      if (!res.ok) return;
      const job = await res.json();

      setJobStatus(job.status);
      if (job.status === "COMPLETED") {
        setOutputMediaUrl(job.outputMediaUrl);
        clearInterval(interval);
      } else if (job.status === "FAILED") {
        setJobError(job.errorMessage);
        clearInterval(interval);
      }
    }, 3000);
  };

  const runDemoSubmit = () => {
    setJobStatus("PENDING");
    toast.success(t("success"));
    setTimeout(() => setJobStatus("PROCESSING"), 1200);
    setTimeout(() => {
      const url = outputType ? DEMO_RESULTS[outputType] : "";
      setOutputMediaUrl(url || null);
      setJobStatus("COMPLETED");
    }, 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isPending) return;

    if (IS_DEMO) {
      startTransition(() => {
        setJobStatus(null);
        setOutputMediaUrl(null);
        setJobError(null);
        runDemoSubmit();
      });
      return;
    }

    startTransition(async () => {
      try {
        setJobStatus(null);
        setOutputMediaUrl(null);
        setJobError(null);

        // Upload source image if it's a file
        let sourceImageUrl: string;
        if (productImage && "file" in productImage) {
          sourceImageUrl = await uploadFile(productImage.file);
        } else if (productImage && "url" in productImage) {
          sourceImageUrl = productImage.url;
        } else {
          throw new Error("No product image");
        }

        // Upload custom background if it's a file
        let backgroundUrl: string | undefined;
        if (background.type === "STOCK") {
          backgroundUrl = background.stockUrl;
        } else if (background.type === "CUSTOM" && background.custom) {
          if ("file" in background.custom) {
            backgroundUrl = await uploadFile(background.custom.file);
          } else {
            backgroundUrl = background.custom.url;
          }
        }

        const res = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            outputType,
            backgroundType: background.type,
            sourceImageUrl,
            backgroundUrl,
            customPrompt: customPrompt || undefined,
            workspaceId: activeWorkspaceId,
            model: model || undefined,
          }),
        });

        if (res.status === 402) {
          toast.error(t("errors.noCredits"));
          return;
        }
        if (!res.ok) {
          toast.error(t("errors.generic"));
          return;
        }

        const { jobId: id } = await res.json();
        setJobStatus("PENDING");
        toast.success(t("success"));
        pollJobStatus(id);
      } catch {
        toast.error(t("errors.generic"));
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] text-[#C4B5FD] text-xs font-medium mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] shadow-[0_0_8px_#8B5CF6]" />
          {t("step1")} — fal.ai
        </div>
        <h1 className="text-2xl font-bold gradient-hero-text">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
        {initialTemplate && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] text-[#C4B5FD] text-xs font-medium">
            <Sparkles className="w-3 h-3" />
            {t("templateApplied")}
          </div>
        )}
      </div>

      {/* Two-column layout */}
      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* LEFT — Controls */}
          <div className="space-y-5">

            {/* Step 1: Product Image */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 hover:border-[rgba(255,255,255,0.12)] transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 gradient-brand rounded-full text-white text-xs font-bold flex items-center justify-center shadow-[0_4px_12px_rgba(139,92,246,0.3)]">1</span>
                <span className="text-sm font-semibold">{t("step1")}</span>
                <span className="text-[#8B5CF6] text-sm">{t("required")}</span>
              </div>
              {!IS_DEMO && (
                <ShopifyProductPicker onSelect={(url) => setProductImage({ url })} />
              )}
              <Dropzone value={productImage} onChange={setProductImage} />
            </div>

            {/* Step 2: Output Type */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 hover:border-[rgba(255,255,255,0.12)] transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 gradient-brand rounded-full text-white text-xs font-bold flex items-center justify-center shadow-[0_4px_12px_rgba(139,92,246,0.3)]">2</span>
                <span className="text-sm font-semibold">{t("step2")}</span>
                <span className="text-[#8B5CF6] text-sm">{t("required")}</span>
              </div>
              <OutputTypePicker
                value={outputType}
                onChange={(v) => {
                  setOutputType(v);
                  setModel(null);
                }}
              />
              <ModelPicker outputType={outputType} value={model} onChange={setModel} />
            </div>

            {/* Step 3: Background */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 hover:border-[rgba(255,255,255,0.12)] transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-[var(--surface-3)] text-muted-foreground text-xs font-bold flex items-center justify-center">3</span>
                <span className="text-sm font-semibold">{t("step3")}</span>
                <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-[var(--surface-3)] border border-[var(--border)]">{t("optional")}</span>
              </div>
              <BackgroundPicker value={background} onChange={setBackground} />
            </div>

            {/* Step 4: Custom Prompt */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 hover:border-[rgba(255,255,255,0.12)] transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-[var(--surface-3)] text-muted-foreground text-xs font-bold flex items-center justify-center">4</span>
                <span className="text-sm font-semibold">{t("step4")}</span>
                <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-[var(--surface-3)] border border-[var(--border)]">{t("optional")}</span>
              </div>
              <CampaignPresets selectedId={selectedCampaign} onSelect={handleCampaignSelect} />
              <Textarea
                value={customPrompt}
                onChange={(e) => {
                  setCustomPrompt(e.target.value);
                  setSelectedCampaign(null);
                }}
                placeholder={t("promptPlaceholder")}
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {customPrompt.length}/500
              </p>
              <ComplianceWarning text={customPrompt} />
            </div>

            {/* Submit */}
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={!isValid || isPending}
                className="w-full h-12 text-sm font-semibold gradient-brand text-white border-none shadow-[0_8px_24px_rgba(139,92,246,0.35)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("processing")}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t("submit")}
                  </>
                )}
              </Button>
            </motion.div>
          </div>

          {/* RIGHT — Preview */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl min-h-[400px] lg:min-h-0">
            <PreviewPane
              status={jobStatus}
              outputMediaUrl={outputMediaUrl}
              errorMessage={jobError}
              isVideo={outputType === "UGC_VIDEO"}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
