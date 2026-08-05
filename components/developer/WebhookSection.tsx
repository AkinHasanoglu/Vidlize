"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export type WebhookConfig = { url: string; secret: string } | null;

interface Props {
  endpoint: WebhookConfig;
  disabled?: boolean;
}

export function WebhookSection({ endpoint, disabled }: Props) {
  const t = useTranslations("developer.webhook");
  const router = useRouter();
  const [url, setUrl] = useState(endpoint?.url ?? "");
  const [busy, setBusy] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("saved"));
      router.refresh();
    } catch {
      toast.error(t("saveFailed"));
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/webhook", { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(t("removed"));
      setUrl("");
      router.refresh();
    } catch {
      toast.error(t("removeFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">{t("title")}</h2>
      <p className="text-xs text-muted-foreground">{t("description")}</p>

      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <Label htmlFor="webhook-url" className="text-xs text-muted-foreground">
            {t("url")}
          </Label>
          <Input
            id="webhook-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/webhooks/ugc"
            disabled={disabled}
            required
            className="mt-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            size="sm"
            disabled={busy || disabled}
            className="gradient-brand text-white border-none"
          >
            {t("save")}
          </Button>
          {endpoint && (
            <Button type="button" variant="ghost" size="sm" disabled={busy || disabled} onClick={handleRemove}>
              {t("remove")}
            </Button>
          )}
        </div>
      </form>

      {endpoint?.secret && (
        <div className="pt-2 border-t border-[var(--border)]">
          <p className="text-xs text-muted-foreground mb-1">{t("secretLabel")}</p>
          <code className="text-xs bg-black/30 rounded-md px-2 py-1.5 break-all block">{endpoint.secret}</code>
        </div>
      )}
    </div>
  );
}
