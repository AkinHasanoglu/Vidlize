"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Loader2, AlertCircle, CheckCircle2, Clock, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PostEditor } from "@/components/studio/PostEditor";
import { cn } from "@/lib/utils";

export type JobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | null;

interface Props {
  status: JobStatus;
  outputMediaUrl?: string | null;
  errorMessage?: string | null;
  isVideo?: boolean;
}

export function PreviewPane({ status, outputMediaUrl, errorMessage, isVideo }: Props) {
  const t = useTranslations("studio.preview");
  const [editing, setEditing] = useState(false);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <AnimatePresence mode="wait">
        {status === null && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center mx-auto mb-4">
              <div className="w-10 h-10 rounded-xl gradient-brand opacity-40" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("emptyHint")}
            </p>
          </motion.div>
        )}

        {(status === "PENDING" || status === "PROCESSING") && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center w-full max-w-sm"
          >
            <Skeleton className="w-full aspect-square rounded-2xl mb-4" />
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-[#8B5CF6]" />
              {status === "PENDING" ? t("waiting") : t("processing")}
            </div>
          </motion.div>
        )}

        {status === "COMPLETED" && outputMediaUrl && (
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-sm"
          >
            <div className="relative rounded-2xl overflow-hidden border border-[rgba(139,92,246,0.3)] shadow-[0_0_40px_rgba(139,92,246,0.2)] mb-4">
              {isVideo ? (
                <video
                  src={outputMediaUrl}
                  controls
                  className="w-full rounded-2xl"
                  playsInline
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={outputMediaUrl}
                  alt="Generated output"
                  className="w-full rounded-2xl"
                />
              )}
            </div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
              <p className="text-sm text-green-400 font-medium">{t("completed")}</p>
            </div>
            <div className="flex items-center gap-2">
              <a href={outputMediaUrl} download target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button className="w-full gradient-brand text-white border-none gap-2">
                  <Download className="h-4 w-4" />
                  {t("download")}
                </Button>
              </a>
              {!isVideo && (
                <Button variant="outline" onClick={() => setEditing((v) => !v)} className="gap-2">
                  <Pencil className="h-4 w-4" />
                  {t("edit")}
                </Button>
              )}
            </div>
            {!isVideo && editing && (
              <PostEditor imageUrl={outputMediaUrl} onClose={() => setEditing(false)} />
            )}
          </motion.div>
        )}

        {status === "FAILED" && (
          <motion.div
            key="failed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center max-w-sm"
          >
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-sm font-medium text-destructive mb-1">{t("failed")}</p>
            {errorMessage && (
              <p className="text-xs text-muted-foreground">{errorMessage}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {t("refunded")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
