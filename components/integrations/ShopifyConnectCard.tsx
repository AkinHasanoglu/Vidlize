"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Store, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  connected: boolean;
  shopDomain?: string | null;
  disabled?: boolean;
}

export function ShopifyConnectCard({ connected, shopDomain, disabled }: Props) {
  const t = useTranslations("integrations");
  const tShopify = useTranslations("integrations.shopify");
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/integrations/shopify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopDomain: domain, accessToken: token }),
      });
      if (!res.ok) throw new Error();
      toast.success(tShopify("connectedTo", { shop: domain }));
      setToken("");
      router.refresh();
    } catch {
      toast.error(tShopify("connectFailed"));
    } finally {
      setBusy(false);
    }
  };

  const handleDisconnect = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/integrations/shopify", { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(tShopify("disconnected"));
      router.refresh();
    } catch {
      toast.error(tShopify("disconnectFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-9 h-9 rounded-xl bg-[#95BF47] flex items-center justify-center shrink-0">
          <Store className="w-4.5 h-4.5 text-white" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{t("platforms.shopify")}</p>
          {connected && shopDomain && (
            <p className="text-xs text-green-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> {shopDomain}
            </p>
          )}
        </div>
      </div>

      {connected ? (
        <Button variant="outline" size="sm" disabled={busy || disabled} onClick={handleDisconnect}>
          {tShopify("disconnect")}
        </Button>
      ) : (
        <form onSubmit={handleConnect} className="space-y-3">
          <div>
            <Label htmlFor="shop-domain" className="text-xs text-muted-foreground">
              {tShopify("shopDomain")}
            </Label>
            <Input
              id="shop-domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder={tShopify("shopDomainPlaceholder")}
              required
              disabled={disabled}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="shop-token" className="text-xs text-muted-foreground">
              {tShopify("accessToken")}
            </Label>
            <Input
              id="shop-token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={tShopify("accessTokenPlaceholder")}
              required
              disabled={disabled}
              className="mt-1"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={busy || disabled}
            className="gradient-brand text-white border-none"
          >
            {busy ? tShopify("connecting") : tShopify("connect")}
          </Button>
        </form>
      )}
    </div>
  );
}
