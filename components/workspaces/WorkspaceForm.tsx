"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export type WorkspaceFormValues = {
  name: string;
  brandColor: string;
  logoUrl: string;
  creditAllocation: string;
};

interface Props {
  initial?: WorkspaceFormValues;
  submitting?: boolean;
  onSubmit: (values: WorkspaceFormValues) => void;
  onCancel: () => void;
}

const DEFAULT_VALUES: WorkspaceFormValues = {
  name: "",
  brandColor: "#8B5CF6",
  logoUrl: "",
  creditAllocation: "",
};

export function WorkspaceForm({ initial, submitting, onSubmit, onCancel }: Props) {
  const t = useTranslations("workspaces");
  const tCommon = useTranslations("common");
  const [values, setValues] = useState<WorkspaceFormValues>(initial ?? DEFAULT_VALUES);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="ws-name" className="text-xs text-muted-foreground">
          {t("name")}
        </Label>
        <Input
          id="ws-name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          placeholder={t("namePlaceholder")}
          maxLength={60}
          required
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="ws-color" className="text-xs text-muted-foreground">
            {t("brandColor")}
          </Label>
          <div className="flex items-center gap-2 mt-1">
            <input
              id="ws-color"
              type="color"
              value={values.brandColor}
              onChange={(e) => setValues((v) => ({ ...v, brandColor: e.target.value }))}
              className="h-9 w-9 rounded-md border border-[var(--border)] bg-transparent p-0.5 shrink-0"
            />
            <Input
              value={values.brandColor}
              onChange={(e) => setValues((v) => ({ ...v, brandColor: e.target.value }))}
              maxLength={7}
              className="font-mono text-xs"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="ws-credits" className="text-xs text-muted-foreground">
            {t("creditAllocation")}
          </Label>
          <Input
            id="ws-credits"
            type="number"
            min={1}
            value={values.creditAllocation}
            onChange={(e) => setValues((v) => ({ ...v, creditAllocation: e.target.value }))}
            placeholder={t("creditAllocationPlaceholder")}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="ws-logo" className="text-xs text-muted-foreground">
          {t("logoUrl")}
        </Label>
        <Input
          id="ws-logo"
          type="url"
          value={values.logoUrl}
          onChange={(e) => setValues((v) => ({ ...v, logoUrl: e.target.value }))}
          placeholder={t("logoUrlPlaceholder")}
          className="mt-1"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={submitting || values.name.trim().length === 0}
          className="gradient-brand text-white border-none"
        >
          {initial ? tCommon("save") : t("create")}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={submitting}>
          {tCommon("cancel")}
        </Button>
      </div>
    </form>
  );
}
