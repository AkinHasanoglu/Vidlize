"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslations } from "next-intl";
import { Upload, Link as LinkIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;

interface Props {
  value: { url: string } | { file: File; preview: string } | null;
  onChange: (val: { url: string } | { file: File; preview: string } | null) => void;
  label?: string;
  urlPlaceholder?: string;
}

export function Dropzone({ value, onChange, label, urlPlaceholder }: Props) {
  const t = useTranslations("studio");
  const [urlInput, setUrlInput] = useState(
    value && "url" in value ? value.url : ""
  );
  const [fileError, setFileError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[]) => {
      setFileError(null);
      const file = accepted[0];
      if (!file) return;
      if (file.size > MAX_BYTES) {
        setFileError(t("errors.fileTooLarge"));
        return;
      }
      const preview = URL.createObjectURL(file);
      onChange({ file, preview });
    },
    [onChange, t]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxSize: MAX_BYTES,
    multiple: false,
    onDropRejected: () => setFileError(t("errors.fileTooLarge")),
  });

  const hasFile = value && "file" in value;
  const preview = hasFile ? (value as { file: File; preview: string }).preview : null;

  return (
    <Tabs defaultValue="url" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-black/30 border border-[var(--border)] h-9">
        <TabsTrigger value="url" className="text-xs gap-1.5">
          <LinkIcon className="h-3 w-3" /> {t("urlTab")}
        </TabsTrigger>
        <TabsTrigger value="file" className="text-xs gap-1.5" onClick={() => onChange(null)}>
          <Upload className="h-3 w-3" /> {t("fileTab")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="url" className="mt-3">
        <Input
          type="url"
          placeholder={urlPlaceholder ?? t("urlPlaceholder")}
          value={urlInput}
          onChange={(e) => {
            setUrlInput(e.target.value);
            const v = e.target.value.trim();
            onChange(v ? { url: v } : null);
          }}
        />
        {value && "url" in value && value.url && (
          <div className="mt-3 flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value.url}
              alt="preview"
              className="w-20 h-20 object-cover rounded-lg border border-[var(--border)]"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        )}
      </TabsContent>

      <TabsContent value="file" className="mt-3">
        {hasFile && preview ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="preview"
              className="w-full max-h-48 object-cover rounded-xl border border-[var(--border)]"
            />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
              isDragActive
                ? "border-[#8B5CF6] bg-[rgba(139,92,246,0.08)] shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                : "border-[var(--border)] hover:border-[rgba(139,92,246,0.4)] hover:bg-[rgba(139,92,246,0.04)]"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              {isDragActive ? t("dragActive") : t("dragPrompt")}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">{t("maxFileSize")}</p>
          </div>
        )}
        {fileError && (
          <p className="text-xs text-destructive mt-2">{fileError}</p>
        )}
      </TabsContent>
    </Tabs>
  );
}
