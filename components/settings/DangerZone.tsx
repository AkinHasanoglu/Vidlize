"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface Props {
  locale: string;
  disabled?: boolean;
}

export function DangerZone({ locale, disabled }: Props) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) throw new Error();
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push(`/${locale}`);
      router.refresh();
    } catch {
      toast.error(t("deleteFailed"));
      setDeleting(false);
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-destructive/30 rounded-2xl p-6 space-y-4">
      <h2 className="text-sm font-semibold text-destructive uppercase tracking-widest">
        {t("danger")}
      </h2>

      {!confirming ? (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">{t("deleteConfirm")}</p>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => setConfirming(true)}
            className="border-destructive/40 text-destructive hover:bg-destructive/10 shrink-0"
          >
            {t("deleteAccount")}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-destructive font-medium">{t("deleteConfirm")}</p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              disabled={deleting}
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? t("deleting") : t("deleteAccount")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={deleting}
              onClick={() => setConfirming(false)}
            >
              {tCommon("cancel")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
