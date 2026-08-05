"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  email: string;
  initialFullName: string;
  disabled?: boolean;
}

export function ProfileForm({ email, initialFullName, disabled }: Props) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const [fullName, setFullName] = useState(initialFullName);
  const [saving, setSaving] = useState(false);

  const dirty = fullName.trim() !== initialFullName.trim();

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: fullName.trim() }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("saved"));
    } catch {
      toast.error(t("saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="fullName" className="text-xs text-muted-foreground">
          {t("fullName")}
        </Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={disabled}
          maxLength={100}
          className="mt-1"
        />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">{t("email")}</Label>
        <p className="text-sm font-medium mt-1.5">{email}</p>
      </div>
      {!disabled && (
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!dirty || saving || fullName.trim().length === 0}
          className="gradient-brand text-white border-none"
        >
          {saving ? t("saving") : tCommon("save")}
        </Button>
      )}
    </div>
  );
}
