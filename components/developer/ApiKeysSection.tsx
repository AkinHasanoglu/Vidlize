"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Trash2, Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type ApiKeySummary = {
  id: string;
  name: string;
  keyPrefix: string;
};

interface Props {
  keys: ApiKeySummary[];
  disabled?: boolean;
}

export function ApiKeysSection({ keys, disabled }: Props) {
  const t = useTranslations("developer.apiKeys");
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNewKey(data.key.fullKey);
      setName("");
      setCreating(false);
      router.refresh();
    } catch {
      toast.error(t("createFailed"));
    } finally {
      setBusy(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!window.confirm(t("revokeConfirm"))) return;
    try {
      const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(t("revoked"));
      router.refresh();
    } catch {
      toast.error(t("revokeFailed"));
    }
  };

  const copyKey = () => {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">{t("title")}</h2>

      {newKey && (
        <div className="rounded-xl border border-[rgba(139,92,246,0.4)] bg-[rgba(139,92,246,0.08)] p-3 space-y-2">
          <p className="text-xs text-[#C4B5FD]">{t("newKeyWarning")}</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-black/30 rounded-md px-2 py-1.5 break-all">{newKey}</code>
            <Button type="button" size="sm" variant="outline" onClick={copyKey} className="shrink-0 gap-1.5">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {keys.length === 0 && !creating && <p className="text-sm text-muted-foreground">{t("empty")}</p>}
        {keys.map((k) => (
          <div
            key={k.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-3 py-2"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{k.name}</p>
              <p className="text-xs text-muted-foreground font-mono">{k.keyPrefix}...</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => handleRevoke(k.id)}
              className="gap-1.5 text-destructive hover:text-destructive shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("revoke")}
            </Button>
          </div>
        ))}
      </div>

      {creating ? (
        <form onSubmit={handleCreate} className="flex items-center gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            required
            maxLength={60}
          />
          <Button
            type="submit"
            size="sm"
            disabled={busy}
            className="gradient-brand text-white border-none shrink-0"
          >
            {t("create")}
          </Button>
        </form>
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => setCreating(true)}
          className="gap-2 border-dashed"
        >
          <Plus className="h-4 w-4" />
          {t("new")}
        </Button>
      )}
    </div>
  );
}
