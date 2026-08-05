"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceForm, type WorkspaceFormValues } from "./WorkspaceForm";

export type Workspace = {
  id: string;
  name: string;
  brandColor: string;
  logoUrl: string | null;
  creditAllocation: number | null;
  creditsUsed: number;
};

interface Props {
  workspaces: Workspace[];
  disabled?: boolean;
}

function toFormValues(w?: Workspace): WorkspaceFormValues | undefined {
  if (!w) return undefined;
  return {
    name: w.name,
    brandColor: w.brandColor,
    logoUrl: w.logoUrl ?? "",
    creditAllocation: w.creditAllocation != null ? String(w.creditAllocation) : "",
  };
}

export function WorkspaceList({ workspaces, disabled }: Props) {
  const t = useTranslations("workspaces");
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "creating" | string>("idle");
  const [submitting, setSubmitting] = useState(false);

  const toPayload = (values: WorkspaceFormValues) => ({
    name: values.name.trim(),
    brandColor: values.brandColor.trim(),
    logoUrl: values.logoUrl.trim() || null,
    creditAllocation: values.creditAllocation.trim() ? Number(values.creditAllocation.trim()) : null,
  });

  const handleCreate = async (values: WorkspaceFormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(values)),
      });
      if (!res.ok) throw new Error();
      toast.success(t("saved"));
      setMode("idle");
      router.refresh();
    } catch {
      toast.error(t("saveFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id: string, values: WorkspaceFormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/workspaces/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(values)),
      });
      if (!res.ok) throw new Error();
      toast.success(t("saved"));
      setMode("idle");
      router.refresh();
    } catch {
      toast.error(t("saveFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("deleteConfirm"))) return;
    try {
      const res = await fetch(`/api/workspaces/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(t("deleted"));
      router.refresh();
    } catch {
      toast.error(t("deleteFailed"));
    }
  };

  return (
    <div className="space-y-4">
      {workspaces.length === 0 && mode !== "creating" && (
        <div className="text-center py-16 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-7 w-7 text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground mb-4">{t("empty")}</p>
        </div>
      )}

      {workspaces.map((w) => (
        <div
          key={w.id}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5"
        >
          {mode === w.id ? (
            <WorkspaceForm
              initial={toFormValues(w)}
              submitting={submitting}
              onSubmit={(values) => handleUpdate(w.id, values)}
              onCancel={() => setMode("idle")}
            />
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
                  style={{ backgroundColor: w.brandColor }}
                >
                  {w.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{w.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {w.creditAllocation != null
                      ? t("creditsUsed", { used: w.creditsUsed, allocation: w.creditAllocation })
                      : t("creditsUsedUnlimited", { used: w.creditsUsed })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  onClick={() => setMode(w.id)}
                  className="gap-1.5"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {t("edit")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  onClick={() => handleDelete(w.id)}
                  className="gap-1.5 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("delete")}
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}

      {mode === "creating" ? (
        <div className="bg-[var(--surface)] border border-[rgba(139,92,246,0.4)] rounded-2xl p-5">
          <WorkspaceForm submitting={submitting} onSubmit={handleCreate} onCancel={() => setMode("idle")} />
        </div>
      ) : (
        <Button
          variant="outline"
          disabled={disabled}
          onClick={() => setMode("creating")}
          className="gap-2 border-dashed"
        >
          <Plus className="h-4 w-4" />
          {t("new")}
        </Button>
      )}
    </div>
  );
}
