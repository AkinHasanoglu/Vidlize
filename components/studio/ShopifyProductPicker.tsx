"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface Product {
  id: string;
  title: string;
  imageUrl: string | null;
}

interface Props {
  onSelect: (url: string) => void;
}

export function ShopifyProductPicker({ onSelect }: Props) {
  const t = useTranslations("studio.shopifyPicker");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/integrations/shopify/products")
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((data: { products?: Product[] }) => {
        if (!cancelled) setProducts((data.products ?? []).filter((p) => p.imageUrl));
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (products.length === 0) return null;

  return (
    <div className="mb-3">
      <p className="text-xs text-muted-foreground mb-2">{t("label")}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {products.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.imageUrl!)}
            title={p.title}
            className="relative w-14 h-14 rounded-lg overflow-hidden border border-[var(--border)] shrink-0 hover:border-[#8B5CF6] transition-colors"
          >
            <Image src={p.imageUrl!} alt={p.title} fill className="object-cover" sizes="56px" />
          </button>
        ))}
      </div>
    </div>
  );
}
